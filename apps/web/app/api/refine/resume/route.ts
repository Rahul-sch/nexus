import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { RefineResumeSchema } from '@nexus/shared';
import { getUserId, checkUserQuota, incrementTokenUsage } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getDecryptedKeysForUser } from '@/lib/vault/server';
import { redactLog, serializeError } from '@/lib/logging';
import type { WorkerDependencies } from '@nexus/orchestration';

export const runtime = 'nodejs';
export const maxDuration = 300;

function buildAugmentedPrompt(
  original: string,
  questions: string[],
  answers: string[]
): string {
  if (questions.length === 0) return original;

  const qaPairs = questions
    .map((q, i) => `Q: ${q}\nA: ${answers[i] || '(no answer)'}`)
    .join('\n\n');

  return `${original}\n\n---\nCLARIFICATIONS PROVIDED:\n${qaPairs}\n---`;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await rateLimit(userId, 'refine');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const quotaCheck = await checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'Quota exceeded', message: quotaCheck.message },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = RefineResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Get refinery
    const { data: refinery, error: fetchError } = await supabase
      .from('refineries')
      .select('id, user_id, status, initial_prompt, config')
      .eq('id', parsed.data.refinery_id)
      .single();

    if (fetchError || !refinery || refinery.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (refinery.status !== 'awaiting_user') {
      return NextResponse.json(
        { error: 'Invalid status', expected: 'awaiting_user', current: refinery.status },
        { status: 400 }
      );
    }

    // Get clarification questions from artifact
    const { data: artifact } = await supabase
      .from('artifacts')
      .select('content')
      .eq('refinery_id', refinery.id)
      .eq('artifact_type', 'clarification_questions')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const questions: string[] = artifact?.content?.questions || [];

    // Build augmented prompt
    const augmentedPrompt = buildAugmentedPrompt(
      refinery.initial_prompt,
      questions,
      parsed.data.answers
    );

    // Check for required API keys
    const keys = await getDecryptedKeysForUser(userId, supabase);
    const requiredProviders = ['anthropic', 'openai'];
    const missingProviders = requiredProviders.filter(p => !keys[p]);

    if (missingProviders.length > 0) {
      return NextResponse.json(
        { error: 'Missing API keys', providers: missingProviders },
        { status: 400 }
      );
    }

    // Update refinery
    await supabase
      .from('refineries')
      .update({
        augmented_prompt: augmentedPrompt,
        status: 'queued',
        current_phase: 'clarifying',
        current_iteration: 1,
        started_at: new Date().toISOString(),
        running_since: new Date().toISOString()
      })
      .eq('id', refinery.id);

    // Store Q&A as message
    await supabase.from('messages').insert({
      refinery_id: refinery.id,
      role: 'user',
      content: JSON.stringify({ questions, answers: parsed.data.answers }),
      iteration: 1,
    });

    // Execute inline in dev mode
    if (process.env.DEV_INLINE_WORKER === 'true' || process.env.NODE_ENV === 'development') {
      executeInlineRefinement(refinery.id, userId, supabase, keys).catch(err => {
        redactLog('error', 'Inline worker failed on resume', { error: serializeError(err) });
      });
    }

    return NextResponse.json({
      job_id: refinery.id,
      channel: `private:refinery:${refinery.id}`,
      status: 'queued',
    });

  } catch (error) {
    redactLog('error', 'Resume error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Inline execution for dev mode
async function executeInlineRefinement(
  refineryId: string,
  userId: string,
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  keys: Record<string, string>
) {
  try {
    const { executeRefinement } = await import('@nexus/orchestration');

    const deps: WorkerDependencies = {
      getRefinery: async (id: string) => {
        const { data, error } = await supabase
          .from('refineries')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) throw new Error('Refinery not found');
        return data;
      },

      getDecryptedKeys: async () => keys,

      updateRefineryStatus: async (id: string, status: string, data?: Record<string, unknown>) => {
        await supabase
          .from('refineries')
          .update({ status, ...data })
          .eq('id', id);
      },

      checkRefineryStatus: async (id: string) => {
        const { data } = await supabase
          .from('refineries')
          .select('status')
          .eq('id', id)
          .single();
        return data?.status || 'unknown';
      },

      incrementTokenUsage: async (uid: string, tokens: number) => {
        await incrementTokenUsage(uid, tokens);
      }
    };

    await executeRefinement(refineryId, userId, deps);

  } catch (error) {
    redactLog('error', 'Inline refinement execution failed', { refineryId, error: serializeError(error) });

    await supabase
      .from('refineries')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'EXECUTION_ERROR',
        completed_at: new Date().toISOString()
      })
      .eq('id', refineryId);
  }
}

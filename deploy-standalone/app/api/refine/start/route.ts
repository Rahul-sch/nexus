import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { RefineStartSchema } from '@nexus/shared';
import { getUserId, checkUserQuota, incrementTokenUsage } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getDecryptedKeysForUser } from '@/lib/vault/server';
import { redactLog, serializeError } from '@/lib/logging';
import type { WorkerDependencies } from '@nexus/orchestration';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for serverless

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
    const parsed = RefineStartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Verify ownership + status
    const { data: refinery, error: fetchError } = await supabase
      .from('refineries')
      .select('id, user_id, status, initial_prompt, augmented_prompt, config')
      .eq('id', parsed.data.refinery_id)
      .single();

    if (fetchError || !refinery || refinery.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (refinery.status !== 'pending' && refinery.status !== 'awaiting_user') {
      return NextResponse.json(
        { error: 'Invalid status', current: refinery.status, expected: ['pending', 'awaiting_user'] },
        { status: 400 }
      );
    }

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

    // Update to queued
    await supabase
      .from('refineries')
      .update({
        status: 'queued',
        started_at: new Date().toISOString(),
        running_since: new Date().toISOString()
      })
      .eq('id', parsed.data.refinery_id);

    // Execute inline in dev mode or if DEV_INLINE_WORKER is set
    if (process.env.DEV_INLINE_WORKER === 'true' || process.env.NODE_ENV === 'development') {
      // Don't await - execute in background
      executeInlineRefinement(parsed.data.refinery_id, userId, supabase, keys).catch(err => {
        redactLog('error', 'Inline worker failed', { error: serializeError(err) });
      });
    }
    // In production without inline worker, a separate worker polls for status='queued'

    return NextResponse.json({
      job_id: parsed.data.refinery_id,
      channel: `private:refinery:${parsed.data.refinery_id}`,
      status: 'queued',
    });

  } catch (error) {
    redactLog('error', 'Refine start error', { error: serializeError(error) });
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

    // Update status to failed
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

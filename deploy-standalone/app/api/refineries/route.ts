import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { RefineryCreateSchema, PaginationSchema } from '@nexus/shared';
import { getUserId, checkUserQuota } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

// Default config with model assignments
const DEFAULT_CONFIG = {
  maxIterations: 2,
  temperature: 0.7,
  models: {
    clarifier: 'claude-3-5-sonnet-20241022',
    drafter: 'gpt-4o',
    critic: 'gpt-4o-mini',
    finalizer: 'claude-3-5-sonnet-20241022'
  }
};

// POST: Create new refinery
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await rateLimit(userId, 'default');
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
    const parsed = RefineryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Merge user config with defaults
    const config = {
      ...DEFAULT_CONFIG,
      ...(parsed.data.config || {}),
      models: DEFAULT_CONFIG.models // Always use default models for now
    };

    const { data, error } = await supabase
      .from('refineries')
      .insert({
        user_id: userId,
        initial_prompt: parsed.data.initial_prompt,
        config,
        status: 'pending',
        current_phase: null,
        current_iteration: 1,
        total_tokens_used: 0,
      })
      .select('id, status, created_at, initial_prompt, config')
      .single();

    if (error) {
      redactLog('error', 'Refinery create error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to create refinery' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    redactLog('error', 'Refinery POST error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List refineries
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    let pagination;
    try {
      pagination = PaginationSchema.parse({
        limit: searchParams.get('limit') || 10,
        offset: searchParams.get('offset') || 0,
        status: searchParams.get('status') || undefined,
      });
    } catch {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from('refineries')
      .select('id, title, status, initial_prompt, final_prompt, current_phase, current_iteration, total_tokens_used, created_at, updated_at, completed_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pagination.status) {
      query = query.eq('status', pagination.status);
    }

    const { data, count, error } = await query
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) {
      redactLog('error', 'Refinery list error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to fetch refineries' }, { status: 500 });
    }

    return NextResponse.json({
      refineries: data || [],
      total: count || 0,
      hasMore: (pagination.offset + pagination.limit) < (count || 0),
    });

  } catch (error) {
    redactLog('error', 'Refinery GET error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

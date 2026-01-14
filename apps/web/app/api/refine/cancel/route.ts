import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { RefineCancelSchema } from '@nexus/shared';
import { getUserId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit cancel operations
    const rateLimitResult = await rateLimit(userId, 'default');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      );
    }

    const body = await req.json();
    const parsed = RefineCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Verify ownership
    const { data: refinery, error: fetchError } = await supabase
      .from('refineries')
      .select('id, user_id, status')
      .eq('id', parsed.data.refinery_id)
      .single();

    if (fetchError || !refinery || refinery.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check if already in terminal state
    if (refinery.status === 'completed' || refinery.status === 'failed' || refinery.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        status: refinery.status,
        message: `Cannot cancel - refinery is already ${refinery.status}`,
      });
    }

    // Update to cancelled
    const { error } = await supabase
      .from('refineries')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', parsed.data.refinery_id);

    if (error) {
      redactLog('error', 'Refine cancel update error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: 'cancelled',
    });

  } catch (error) {
    redactLog('error', 'Refine cancel error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

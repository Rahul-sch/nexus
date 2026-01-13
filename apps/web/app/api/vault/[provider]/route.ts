import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

// DELETE: Remove API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await rateLimit(userId, 'vault');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const { provider } = await params;
    const supabase = createAdminSupabaseClient();

    // Verify entry exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('vault_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_type', provider)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('user_id', userId)
      .eq('provider_type', provider);

    if (error) {
      redactLog('error', 'Vault delete error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    redactLog('error', 'Vault DELETE error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get key metadata for specific provider
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('vault_entries')
      .select('id, provider_type, key_hint, is_valid, validated_at, created_at, updated_at')
      .eq('user_id', userId)
      .eq('provider_type', provider)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    redactLog('error', 'Vault GET provider error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

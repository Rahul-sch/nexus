import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { VaultCreateSchema } from '@nexus/shared';
import { getUserId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { encryptApiKey } from '@/lib/vault/server';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

// POST: Add new API key
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = VaultCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check if entry already exists for this provider
    const { data: existing } = await supabase
      .from('vault_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_type', parsed.data.provider_type)
      .single();

    if (existing) {
      // Update existing entry
      const encrypted = encryptApiKey(parsed.data.api_key);

      const { data, error } = await supabase
        .from('vault_entries')
        .update({
          encrypted_api_key: encrypted.encrypted_api_key,
          api_key_iv: encrypted.api_key_iv,
          encrypted_dek: encrypted.encrypted_dek,
          dek_iv: encrypted.dek_iv,
          key_hint: encrypted.key_hint,
          is_valid: null,
          validated_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('id, provider_type, key_hint, created_at, updated_at')
        .single();

      if (error) {
        redactLog('error', 'Vault update error', { error: serializeError(error) });
        return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    // Encrypt API key server-side
    const encrypted = encryptApiKey(parsed.data.api_key);

    // Store encrypted entry
    const { data, error } = await supabase
      .from('vault_entries')
      .insert({
        user_id: userId,
        provider_type: parsed.data.provider_type,
        encrypted_api_key: encrypted.encrypted_api_key,
        api_key_iv: encrypted.api_key_iv,
        encrypted_dek: encrypted.encrypted_dek,
        dek_iv: encrypted.dek_iv,
        key_hint: encrypted.key_hint,
        is_valid: null,
        validated_at: null,
      })
      .select('id, provider_type, key_hint, created_at')
      .single();

    if (error) {
      redactLog('error', 'Vault insert error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to store key' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    redactLog('error', 'Vault POST error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List keys (metadata only)
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit read operations to prevent enumeration
    const rateLimitResult = await rateLimit(userId, 'read');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('vault_entries')
      .select('id, provider_type, key_hint, is_valid, validated_at, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      redactLog('error', 'Vault fetch error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
    }

    return NextResponse.json({ entries: data || [] });

  } catch (error) {
    redactLog('error', 'Vault GET error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

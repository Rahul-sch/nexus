import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { decryptApiKey } from '@/lib/vault/server';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

// Model to use for validation (cheap/fast models)
const VALIDATION_MODELS: Record<string, string> = {
  anthropic: 'claude-3-haiku-20240307',
  openai: 'gpt-4o-mini',
  xai: 'grok-beta',
  deepseek: 'deepseek-chat',
};

// POST: Test API key validity
export async function POST(
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

    // Fetch encrypted entry
    const { data: entry, error: fetchError } = await supabase
      .from('vault_entries')
      .select('id, encrypted_api_key, api_key_iv, encrypted_dek, dek_iv, key_hint')
      .eq('user_id', userId)
      .eq('provider_type', provider)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    // Decrypt JIT
    let apiKey: string;
    try {
      apiKey = decryptApiKey({
        encrypted_api_key: entry.encrypted_api_key,
        api_key_iv: entry.api_key_iv,
        encrypted_dek: entry.encrypted_dek,
        dek_iv: entry.dek_iv,
        key_hint: entry.key_hint,
      });
    } catch (decryptError) {
      redactLog('error', 'Decryption failed', { provider, error: serializeError(decryptError) });
      await supabase
        .from('vault_entries')
        .update({ is_valid: false, validated_at: new Date().toISOString() })
        .eq('id', entry.id);
      return NextResponse.json({ is_valid: false, error: 'Decryption failed' });
    }

    // Test with provider
    try {
      const { createProvider } = await import('@nexus/orchestration');
      const providerInstance = createProvider(provider, apiKey);
      const model = VALIDATION_MODELS[provider] || 'default';

      await providerInstance.chat({
        model,
        system: 'You are a helpful assistant.',
        messages: [{ role: 'user', content: 'Say "OK".' }],
        temperature: 0.1,
        maxTokens: 10,
      });

      // Update validation status - success
      await supabase
        .from('vault_entries')
        .update({ is_valid: true, validated_at: new Date().toISOString() })
        .eq('id', entry.id);

      return NextResponse.json({ is_valid: true });

    } catch (apiError) {
      // Mark invalid
      await supabase
        .from('vault_entries')
        .update({ is_valid: false, validated_at: new Date().toISOString() })
        .eq('id', entry.id);

      redactLog('warn', 'API key validation failed', {
        provider,
        error: serializeError(apiError)
      });

      return NextResponse.json({
        is_valid: false,
        error: 'Invalid API key or provider error',
      });
    }

  } catch (error) {
    redactLog('error', 'Vault validate error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

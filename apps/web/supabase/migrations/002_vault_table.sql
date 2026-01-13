-- Migration 002: Vault Table
-- Secure storage for encrypted API keys with RLS

CREATE TABLE public.vault_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('anthropic', 'openai', 'xai', 'deepseek')),
    encrypted_api_key BYTEA NOT NULL,
    api_key_iv BYTEA NOT NULL,
    encrypted_dek BYTEA NOT NULL,
    dek_iv BYTEA NOT NULL,
    key_hint CHAR(4) NOT NULL,
    is_valid BOOLEAN DEFAULT NULL,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, provider_type)
);

CREATE INDEX idx_vault_user ON public.vault_entries(user_id);
CREATE TRIGGER tr_vault_updated BEFORE UPDATE ON public.vault_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vault_select_own" ON public.vault_entries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "vault_delete_own" ON public.vault_entries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

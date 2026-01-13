-- Migration 004: Usage Quotas
-- Track token usage and enforce limits with RLS

CREATE TABLE public.usage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tokens_used_today INTEGER DEFAULT 0 NOT NULL,
    tokens_used_month INTEGER DEFAULT 0 NOT NULL,
    daily_limit INTEGER DEFAULT 100000 NOT NULL,
    monthly_limit INTEGER DEFAULT 3000000 NOT NULL,
    last_reset_daily TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_reset_monthly TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

CREATE INDEX idx_quotas_user ON public.usage_quotas(user_id);
CREATE TRIGGER tr_quotas_updated BEFORE UPDATE ON public.usage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotas_select_own" ON public.usage_quotas
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

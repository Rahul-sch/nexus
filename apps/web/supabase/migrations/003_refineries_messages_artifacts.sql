-- Migration 003: Refineries + Messages + Artifacts
-- Core tables for prompt refinery system with RLS

CREATE TABLE public.refineries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'awaiting_user')),
    initial_prompt TEXT NOT NULL,
    augmented_prompt TEXT,
    final_prompt TEXT,
    config JSONB DEFAULT '{"maxIterations": 2, "temperature": 0.7}' NOT NULL,
    current_phase TEXT,
    current_iteration INTEGER DEFAULT 1,
    total_tokens_used INTEGER DEFAULT 0,
    error_message TEXT,
    error_code TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    running_since TIMESTAMPTZ,
    heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_refineries_user_id ON public.refineries(user_id);
CREATE INDEX idx_refineries_status ON public.refineries(status);
CREATE INDEX idx_refineries_created_at ON public.refineries(created_at DESC);
CREATE TRIGGER tr_refineries_updated BEFORE UPDATE ON public.refineries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refinery_id UUID NOT NULL REFERENCES public.refineries(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('clarifier', 'drafter', 'critic', 'finalizer', 'user', 'system')),
    content TEXT NOT NULL,
    provider_type TEXT,
    model_id TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    iteration INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_refinery_id ON public.messages(refinery_id);

CREATE TABLE public.artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refinery_id UUID NOT NULL REFERENCES public.refineries(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    artifact_type TEXT NOT NULL CHECK (artifact_type IN ('draft', 'critique', 'final', 'clarification_questions')),
    content JSONB NOT NULL,
    iteration INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_artifacts_refinery_id ON public.artifacts(refinery_id);

ALTER TABLE public.refineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refineries_select_own" ON public.refineries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "refineries_delete_own" ON public.refineries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "messages_select_own" ON public.messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = messages.refinery_id
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "artifacts_select_own" ON public.artifacts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = artifacts.refinery_id
            AND r.user_id = auth.uid()
        )
    );

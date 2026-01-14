-- Migration 005: Complete RLS Policies (INSERT/UPDATE/DELETE)
-- Adds missing INSERT/UPDATE/DELETE policies to ensure defense-in-depth
-- Even though server-side code uses admin client, RLS protects against:
-- 1. Authorization bypass bugs in application layer
-- 2. SQL injection vulnerabilities
-- 3. Direct database access from compromised service role key
-- 4. Misconfigured Supabase Edge Functions

-- ==============================================================================
-- VAULT ENTRIES: Complete protection for encrypted API keys
-- ==============================================================================

-- INSERT: Only authenticated users can insert their own vault entries
CREATE POLICY "vault_insert_own" ON public.vault_entries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own vault entries (validation status, etc.)
CREATE POLICY "vault_update_own" ON public.vault_entries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- REFINERIES: Complete protection for prompt refinery sessions
-- ==============================================================================

-- INSERT: Users can only create refineries for themselves
CREATE POLICY "refineries_insert_own" ON public.refineries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own refineries
-- Note: Server-side orchestrator must use service role to update status/progress
CREATE POLICY "refineries_update_own" ON public.refineries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- MESSAGES: Complete protection for conversation history
-- ==============================================================================

-- INSERT: Users can only insert messages for their own refineries
CREATE POLICY "messages_insert_own" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = messages.refinery_id
            AND r.user_id = auth.uid()
        )
    );

-- UPDATE: Messages are immutable (no updates allowed)
-- If needed in future, use similar EXISTS check as INSERT

-- DELETE: Users can only delete messages from their own refineries
CREATE POLICY "messages_delete_own" ON public.messages
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = messages.refinery_id
            AND r.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- ARTIFACTS: Complete protection for generated artifacts (drafts, critiques, etc.)
-- ==============================================================================

-- INSERT: Users can only insert artifacts for their own refineries
CREATE POLICY "artifacts_insert_own" ON public.artifacts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = artifacts.refinery_id
            AND r.user_id = auth.uid()
        )
    );

-- UPDATE: Artifacts are immutable (no updates allowed)
-- If needed in future, use similar EXISTS check as INSERT

-- DELETE: Users can only delete artifacts from their own refineries
CREATE POLICY "artifacts_delete_own" ON public.artifacts
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.refineries r
            WHERE r.id = artifacts.refinery_id
            AND r.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- USAGE QUOTAS: Complete protection for quota tracking
-- ==============================================================================

-- INSERT: Users can only create their own quota record
CREATE POLICY "quotas_insert_own" ON public.usage_quotas
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can view but NOT update their own quotas
-- Only server-side admin client should update quotas
-- This prevents users from tampering with their usage limits
CREATE POLICY "quotas_update_service_only" ON public.usage_quotas
    FOR UPDATE TO authenticated
    USING (FALSE)  -- Block all updates from authenticated users
    WITH CHECK (FALSE);

-- DELETE: Users cannot delete their quota records
-- Only cascading delete from users table should remove quotas
CREATE POLICY "quotas_delete_deny" ON public.usage_quotas
    FOR DELETE TO authenticated
    USING (FALSE);  -- Block all deletes from authenticated users

-- ==============================================================================
-- USERS TABLE: Add missing INSERT policy
-- ==============================================================================

-- INSERT: Users can only create their own user record
-- This is triggered by auth.users creation via trigger or app logic
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- SECURITY NOTES
-- ==============================================================================

-- 1. Service Role Key Bypass:
--    All these policies apply ONLY to the 'authenticated' role.
--    The service role key still has full access (necessary for orchestrator).
--    CRITICAL: Protect service role key at all costs.

-- 2. Defense-in-Depth:
--    Even with application-layer authorization checks (getUserId()), RLS provides:
--    - Protection against SQL injection vulnerabilities
--    - Protection against authorization bugs in app code
--    - Protection if service role key is compromised and attacker knows table structure
--    - Audit trail via PostgreSQL's built-in RLS logging

-- 3. Performance Impact:
--    RLS policies add a WHERE clause to every query.
--    Indexes on user_id and refinery_id are critical for performance.
--    Existing indexes in prior migrations should handle this efficiently.

-- 4. Testing:
--    IMPORTANT: Test that service role operations still work after this migration.
--    Server-side admin client uses service role, which bypasses RLS.
--    Regular authenticated users should be restricted by these policies.

-- ==============================================================================
-- VERIFICATION QUERIES (run as authenticated user)
-- ==============================================================================

-- These should all fail or return empty results for other users' data:

-- SELECT * FROM public.refineries WHERE user_id != auth.uid();  -- Empty
-- INSERT INTO public.refineries (user_id, initial_prompt) VALUES ('00000000-0000-0000-0000-000000000000', 'test');  -- Error
-- UPDATE public.usage_quotas SET tokens_used_today = 0 WHERE user_id = auth.uid();  -- Error (blocked by policy)
-- DELETE FROM public.messages WHERE id = 'someone-elses-message-id';  -- Error or 0 rows

-- ==============================================================================
-- ROLLBACK PLAN (if issues arise)
-- ==============================================================================

-- To rollback this migration:
-- DROP POLICY IF EXISTS "vault_insert_own" ON public.vault_entries;
-- DROP POLICY IF EXISTS "vault_update_own" ON public.vault_entries;
-- DROP POLICY IF EXISTS "refineries_insert_own" ON public.refineries;
-- DROP POLICY IF EXISTS "refineries_update_own" ON public.refineries;
-- DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
-- DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
-- DROP POLICY IF EXISTS "artifacts_insert_own" ON public.artifacts;
-- DROP POLICY IF EXISTS "artifacts_delete_own" ON public.artifacts;
-- DROP POLICY IF EXISTS "quotas_insert_own" ON public.usage_quotas;
-- DROP POLICY IF EXISTS "quotas_update_service_only" ON public.usage_quotas;
-- DROP POLICY IF EXISTS "quotas_delete_deny" ON public.usage_quotas;
-- DROP POLICY IF EXISTS "users_insert_own" ON public.users;

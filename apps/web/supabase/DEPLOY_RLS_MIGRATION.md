# Deploying RLS Migration (005)

## Overview

This migration adds comprehensive INSERT/UPDATE/DELETE policies to all tables, ensuring defense-in-depth security even though the application uses an admin client for server-side operations.

## Security Impact

### Before Migration:
- ❌ RLS only protected SELECT and partial DELETE operations
- ❌ Relied entirely on application-layer authorization (`getUserId()`)
- ❌ Vulnerable if app auth is bypassed (SQL injection, logic bugs, etc.)

### After Migration:
- ✅ Complete RLS coverage on all operations (SELECT, INSERT, UPDATE, DELETE)
- ✅ Database-level enforcement prevents unauthorized data access
- ✅ Protection against SQL injection and authorization bypass bugs
- ✅ Service role still works (policies only apply to 'authenticated' role)

## Deployment Methods

### Option 1: Supabase Dashboard (Recommended for Quick Deploy)

1. Go to: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/sql/new

2. Copy the entire contents of `005_rls_insert_update_policies.sql`

3. Paste into the SQL Editor

4. Click "Run" button

5. Verify success (should see "Success. No rows returned")

6. Test application still works (service role should bypass RLS)

### Option 2: Supabase CLI (Recommended for Team Deployments)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref ztmlfiyqeqdbsyboilmf

# Apply pending migrations
supabase db push

# Verify migration applied
supabase db migrations list
```

### Option 3: Manual psql Connection

```bash
# Get connection string from:
# https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/settings/database

psql "postgresql://postgres:[password]@db.ztmlfiyqeqdbsyboilmf.supabase.co:5432/postgres" \
  -f supabase/migrations/005_rls_insert_update_policies.sql
```

### Option 4: Programmatic Deployment (Node.js)

```typescript
// scripts/deploy-rls-migration.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function deployMigration() {
  const migrationSql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/005_rls_insert_update_policies.sql'),
    'utf-8'
  );

  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSql });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration 005 deployed successfully');
}

deployMigration();
```

Run with:
```bash
tsx scripts/deploy-rls-migration.ts
```

## Post-Deployment Verification

### 1. Verify Policies Exist

```sql
-- Run in Supabase SQL Editor
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

Expected policies per table:
- `users`: SELECT, INSERT, UPDATE (3 policies)
- `vault_entries`: SELECT, INSERT, UPDATE, DELETE (4 policies)
- `refineries`: SELECT, INSERT, UPDATE, DELETE (4 policies)
- `messages`: SELECT, INSERT, DELETE (3 policies)
- `artifacts`: SELECT, INSERT, DELETE (3 policies)
- `usage_quotas`: SELECT, INSERT, UPDATE (blocked), DELETE (blocked) (4 policies)

### 2. Test Application Functionality

```bash
# Start development server
npm run dev

# Test critical flows:
# 1. Login/signup → Should work
# 2. Create new refinery → Should work (service role INSERT)
# 3. View refineries → Should only show your own
# 4. Delete refinery → Should only delete your own
# 5. Add API key → Should work (service role INSERT)
# 6. View API keys → Should only show your own
```

### 3. Test Authorization Enforcement

Open browser console and try direct Supabase queries (should fail):

```javascript
// This should return EMPTY (not other users' data)
const { data, error } = await supabase
  .from('refineries')
  .select('*')
  .neq('user_id', 'your-user-id');

console.log(data); // Should be []

// This should FAIL (cannot insert for another user)
const { error: insertError } = await supabase
  .from('refineries')
  .insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    initial_prompt: 'hack attempt'
  });

console.log(insertError); // Should show RLS policy violation

// This should FAIL (cannot update quotas as regular user)
const { error: quotaError } = await supabase
  .from('usage_quotas')
  .update({ tokens_used_today: 0 })
  .eq('user_id', 'your-user-id');

console.log(quotaError); // Should show RLS policy violation
```

### 4. Verify Service Role Still Works

```typescript
// In your API route (should work normally)
import { createAdminClient } from '@/lib/supabase/server';

const supabase = createAdminClient();

// This should succeed (service role bypasses RLS)
const { data, error } = await supabase
  .from('refineries')
  .insert({
    user_id: userId,
    initial_prompt: 'test',
  });

console.log(data); // Should return inserted row
```

## Rollback Plan

If issues arise after deployment, rollback with:

```sql
-- Drop all new policies (keep original SELECT/DELETE policies)
DROP POLICY IF EXISTS "vault_insert_own" ON public.vault_entries;
DROP POLICY IF EXISTS "vault_update_own" ON public.vault_entries;
DROP POLICY IF EXISTS "refineries_insert_own" ON public.refineries;
DROP POLICY IF EXISTS "refineries_update_own" ON public.refineries;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "artifacts_insert_own" ON public.artifacts;
DROP POLICY IF EXISTS "artifacts_delete_own" ON public.artifacts;
DROP POLICY IF EXISTS "quotas_insert_own" ON public.usage_quotas;
DROP POLICY IF EXISTS "quotas_update_service_only" ON public.usage_quotas;
DROP POLICY IF EXISTS "quotas_delete_deny" ON public.usage_quotas;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
```

## Expected Performance Impact

- **Minimal** - All policies use indexed columns (`user_id`, `refinery_id`)
- Existing indexes from prior migrations handle RLS filtering efficiently
- Service role operations (99% of app) bypass RLS entirely
- Only direct client queries (rare) incur RLS check overhead

## Security Benefits

1. **Defense-in-Depth**: Multiple layers of security (app auth + RLS)
2. **Audit Trail**: PostgreSQL logs RLS policy violations
3. **SQL Injection Protection**: Even if attacker injects SQL, RLS prevents data access
4. **Authorization Bug Protection**: If `getUserId()` fails, RLS still enforces ownership
5. **Compliance**: Meets security requirements for SOC 2, ISO 27001, etc.

## Known Limitations

1. **Service Role = Full Access**: If service role key leaks, RLS is bypassed
   - **Mitigation**: Rotate key immediately if exposed, monitor usage logs

2. **Performance**: RLS adds WHERE clauses to every query
   - **Mitigation**: Ensure proper indexes on `user_id` (already exist)

3. **Quota Updates Blocked**: Users cannot update their own quotas
   - **Expected**: Only server should modify quotas to prevent tampering

## Support

If migration fails or application breaks:

1. Check Supabase logs: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/logs/explorer
2. Review PostgreSQL error messages for policy violations
3. Verify service role key is correctly set in environment variables
4. Test with direct SQL queries to isolate RLS vs application issues

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Defense-in-Depth Security](https://owasp.org/www-community/Defense_in_depth)

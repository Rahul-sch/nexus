# Production Deployment Guide - Nexus (Prompty)

**Status:** Ready for Production Deployment
**Last Updated:** 2026-01-13
**Security Level:** ✅ Hardened

---

## Quick Start (5 Minutes)

### 1. Set Environment Variables in Vercel

```bash
# Public variables (safe to expose):
NEXT_PUBLIC_SUPABASE_URL=https://ztmlfiyqeqdbsyboilmf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxmaXlxZXFkYnN5Ym9pbG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ3MDMsImV4cCI6MjA4Mzg5MDcwM30.BagjK166_Y226X6Ipm-R8oopp3IGxcZZCAl4GC7jm98

# Sensitive variables (mark as "Sensitive" in Vercel dashboard):
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase Dashboard → Settings → API]
VAULT_ENCRYPTION_SECRET=[Generate: openssl rand -base64 32]

# Production Redis (REQUIRED):
UPSTASH_REDIS_REST_URL=[Get from Upstash Console]
UPSTASH_REDIS_REST_TOKEN=[Get from Upstash Console]
```

**⚠️ CRITICAL:**
- Mark `SUPABASE_SERVICE_ROLE_KEY`, `VAULT_ENCRYPTION_SECRET`, and `UPSTASH_REDIS_REST_TOKEN` as **"Sensitive"** in Vercel
- Do NOT set `DEV_INLINE_WORKER=true` in production

### 2. Deploy Database Migration

**Option A: Supabase Dashboard (Fastest)**
1. Go to: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/sql/new
2. Copy entire contents of `supabase/migrations/005_rls_insert_update_policies.sql`
3. Paste into SQL Editor and click "Run"
4. Verify: Should see "Success. No rows returned"

**Option B: Supabase CLI**
```bash
cd nexus/apps/web
supabase link --project-ref ztmlfiyqeqdbsyboilmf
supabase db push
```

### 3. Deploy to Vercel

```bash
git add .
git commit -m "Security hardening complete"
git push origin main

# Or deploy directly:
vercel --prod
```

### 4. Post-Deployment Verification (2 Minutes)

```bash
# Test security headers:
curl -I https://your-app.vercel.app | grep -i "strict-transport-security"
# Expected: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# Test authentication:
# 1. Visit https://your-app.vercel.app/signup
# 2. Try password "test123" → Should show "Very Weak" and block submission
# 3. Use strong password (e.g., "MySecure$Pass123!") → Should allow signup

# Test rate limiting (requires logged-in session):
for i in {1..61}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  https://your-app.vercel.app/api/vault; done | grep -c "429"
# Expected: At least 1 occurrence of "429"
```

---

## Detailed Setup Instructions

### Prerequisites

1. **Supabase Account** - https://supabase.com/dashboard
   - Project created: `ztmlfiyqeqdbsyboilmf`
   - PostgreSQL database ready
   - Auth enabled with OAuth providers configured

2. **Vercel Account** - https://vercel.com
   - Project linked to GitHub repository

3. **Upstash Account** (for production rate limiting) - https://console.upstash.com
   - Redis database created
   - REST API enabled

4. **OAuth Providers** (optional but recommended):
   - Google OAuth credentials
   - GitHub OAuth credentials

---

## Step-by-Step Deployment

### Step 1: Generate Secrets

**Generate Vault Encryption Secret:**
```bash
openssl rand -base64 32
```
**Example output:** `WDpMUb2ancGWewPLq9jUaofN-70LkFxGRTiEfK5NktE`

**Requirements:**
- Minimum 32 characters
- Cryptographically secure (use `openssl` or similar)
- Store securely (once set, changing requires re-encrypting all vault entries)

**Security Note:** If this secret leaks, all user API keys are compromised. See [SECURITY_SETUP.md](SECURITY_SETUP.md) for rotation procedures.

---

### Step 2: Configure Supabase

#### 2.1 Database Migration

Apply RLS policies (see detailed guide: [DEPLOY_RLS_MIGRATION.md](supabase/DEPLOY_RLS_MIGRATION.md)):

```sql
-- Verify current policies:
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Before migration: 8-10 policies
-- After migration: 20+ policies
```

**Expected Result:**
- `users`: 3 policies (SELECT, INSERT, UPDATE)
- `vault_entries`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- `refineries`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- `messages`: 3 policies (SELECT, INSERT, DELETE)
- `artifacts`: 3 policies (SELECT, INSERT, DELETE)
- `usage_quotas`: 4 policies (SELECT, INSERT, UPDATE blocked, DELETE blocked)

#### 2.2 OAuth Provider Setup

**Google OAuth:**
1. Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add Client ID and Client Secret from Google Cloud Console
4. Set Redirect URL: `https://your-app.vercel.app/auth/callback`

**GitHub OAuth:**
1. Dashboard → Authentication → Providers → GitHub
2. Enable GitHub provider
3. Add Client ID and Client Secret from GitHub Developer Settings
4. Set Redirect URL: `https://your-app.vercel.app/auth/callback`

#### 2.3 Auth Settings

Dashboard → Authentication → Settings:
- Enable email confirmations (recommended)
- JWT expiry: 3600 seconds (1 hour)
- Minimum password length: 6 characters (client enforces 12)

---

### Step 3: Configure Upstash Redis

1. Create Redis database: https://console.upstash.com/redis
2. Enable REST API
3. Copy connection details:
   - `UPSTASH_REDIS_REST_URL`: `https://[your-cluster].upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `[your-token]`

**Why Redis?**
- Distributed rate limiting (works across multiple Vercel instances)
- Persistent storage (survives server restarts)
- Low latency (sub-millisecond response times)

**Fallback:** Without Redis, rate limiting uses in-memory storage (development only, resets on restart).

---

### Step 4: Configure Vercel Environment Variables

Go to: Vercel Dashboard → Project → Settings → Environment Variables

**Add the following variables:**

| Variable | Value | Sensitive? | Environment |
|----------|-------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ztmlfiyqeqdbsyboilmf.supabase.co` | No | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[anon key from Supabase]` | No | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `[service role key from Supabase]` | **YES** | Production, Preview |
| `VAULT_ENCRYPTION_SECRET` | `[generated 32+ char secret]` | **YES** | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | `https://[cluster].upstash.io` | No | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | `[token from Upstash]` | **YES** | Production, Preview |

**Mark as Sensitive:**
1. Click on variable after creation
2. Check "Sensitive" checkbox
3. Save

**Why mark as sensitive?**
- Hidden from logs and UI after saving
- Prevents accidental exposure in screenshots/screen shares
- Only accessible via environment at runtime

**DO NOT SET:**
- `DEV_INLINE_WORKER=true` (development only)

---

### Step 5: Deploy Application

#### Option A: GitHub Integration (Recommended)

```bash
# Commit security changes:
git add .
git commit -m "feat: security hardening complete

- Add comprehensive RLS policies (INSERT/UPDATE/DELETE)
- Implement password strength requirements (12+ chars)
- Add rate limiting to all API endpoints
- Enhance security headers (HSTS, COEP, COOP, CORP)
- Add open redirect protection
- Create security documentation"

git push origin main
```

Vercel will automatically deploy on push.

#### Option B: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

#### Option C: Manual Deployment

1. Go to Vercel Dashboard → Project
2. Click "Deployments" tab
3. Click "Redeploy" on latest deployment
4. Select "Use existing Build Cache" → NO (force fresh build)
5. Click "Redeploy"

---

### Step 6: Post-Deployment Verification

#### 6.1 Security Headers Test

```bash
curl -I https://your-app.vercel.app

# Expected headers:
# ✅ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# ✅ Content-Security-Policy: default-src 'self'; ...
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ Cross-Origin-Opener-Policy: same-origin
# ✅ Cross-Origin-Embedder-Policy: require-corp
# ✅ Cross-Origin-Resource-Policy: same-origin
```

**Automated Test:**
Visit https://securityheaders.com and enter your app URL. Expected grade: **A** or **A+**

#### 6.2 Authentication Flow Test

**Password Strength:**
1. Go to: https://your-app.vercel.app/signup
2. Try weak password: `test123`
   - ✅ Submit button should be disabled
   - ✅ Strength meter shows "Very Weak" (red)
   - ✅ Requirements show X marks
3. Try strong password: `MySecure$Pass123!`
   - ✅ Submit button enabled
   - ✅ Strength meter shows "Very Strong" (green)
   - ✅ All requirements show check marks

**OAuth:**
1. Click "Continue with Google"
   - ✅ Redirects to Google login
   - ✅ After auth, redirects to `/dashboard`
2. Click "Continue with GitHub"
   - ✅ Redirects to GitHub login
   - ✅ After auth, redirects to `/dashboard`

#### 6.3 Authorization Test (Manual)

**Test User A cannot access User B's data:**

1. Create User A account and login
2. Create a refinery → Copy refinery ID from URL
   - Example: `https://your-app.vercel.app/refinery/abc-123-def`
3. Logout, create User B account and login
4. Try to access User A's refinery:
   - Navigate to: `https://your-app.vercel.app/refinery/abc-123-def`
   - **✅ Expected:** 404 Not Found or redirect to dashboard
   - **❌ FAIL:** If you see User A's refinery data

**Test API Endpoint:**
```bash
# Get User B's session cookie from browser DevTools
curl https://your-app.vercel.app/api/refineries/abc-123-def \
  -H "Cookie: sb-access-token=USER_B_TOKEN"

# ✅ Expected: {"error":"Not found"} (404)
```

#### 6.4 Rate Limiting Test

**Test Refinery GET endpoint (60 req/min):**

```bash
# Get session cookie from browser (DevTools → Application → Cookies)
COOKIE="sb-access-token=YOUR_SESSION_TOKEN_HERE"

# Send 61 requests:
for i in {1..61}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: $COOKIE" \
    https://your-app.vercel.app/api/vault)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  if [ "$HTTP_CODE" = "429" ]; then
    echo "Request $i: RATE LIMITED (429) ✓"
  else
    echo "Request $i: OK ($HTTP_CODE)"
  fi
done | tail -10

# ✅ Expected: At least 1 "RATE LIMITED (429)" in last 10 requests
```

**Alternative (manual):**
1. Login to your app
2. Open browser DevTools → Network tab
3. Navigate to `/dashboard` repeatedly (refresh 61 times in 1 minute)
4. Check for 429 responses

#### 6.5 Encryption Test

**Verify API keys are encrypted:**

```sql
-- Run in Supabase SQL Editor:
SELECT
  provider_type,
  key_hint,
  length(encrypted_api_key) as encrypted_length,
  length(encrypted_dek) as dek_length
FROM public.vault_entries
LIMIT 5;

-- ✅ Expected:
-- provider_type: 'anthropic', 'openai', etc.
-- key_hint: First 4 chars of API key (e.g., 'sk-a')
-- encrypted_length: 50-200 (binary data)
-- dek_length: 50-100 (binary data)

-- ❌ FAIL: If you see plaintext API keys (starting with 'sk-')
```

#### 6.6 RLS Policy Test

**Verify policies are active:**

```sql
-- Run in Supabase SQL Editor (logged out):
SELECT * FROM public.refineries;

-- ✅ Expected: Error "row-level security policy violated"
-- ❌ FAIL: If you see any data (RLS not enabled)
```

---

## Monitoring & Maintenance

### Daily Checks

**Monitor Rate Limit Exceeded Events:**
```bash
# Check Vercel logs for 429 responses:
vercel logs --prod | grep "429"

# If excessive 429s, consider:
# 1. Legitimate traffic spike → increase limits
# 2. Attack/abuse → investigate source IPs
```

**Monitor Vault Decryption Failures:**
```bash
vercel logs --prod | grep "Vault.*error"

# Possible causes:
# 1. Wrong VAULT_ENCRYPTION_SECRET → rotate and re-encrypt
# 2. Database corruption → restore from backup
```

### Weekly Checks

**Review Supabase Logs:**
1. Dashboard → Logs → PostgreSQL Logs
2. Filter by: `severity: ERROR`
3. Look for:
   - RLS policy violations (potential attack)
   - Repeated failed queries (potential SQL injection attempt)
   - Unusual access patterns

**Dependency Audit:**
```bash
npm audit --production
npm audit fix
```

### Monthly Checks

**Security Header Validation:**
```bash
# Test with securityheaders.com:
curl -I https://your-app.vercel.app | \
  curl -X POST -d @- https://securityheaders.com/api/
```

**Secret Rotation:**
- Rotate service role key every 90 days (see [SECURITY_SETUP.md](SECURITY_SETUP.md))
- Rotate vault encryption secret every 180 days

### Quarterly Security Review

**Complete Security Checklist:**
- [ ] Review [SECURITY.md](SECURITY.md) risk assessment
- [ ] Test authorization bypass scenarios
- [ ] Verify RLS policies still active
- [ ] Check for new dependency vulnerabilities
- [ ] Review Vercel logs for security events
- [ ] Update security documentation

---

## Rollback Procedures

### If Deployment Breaks Application

**Option 1: Vercel Instant Rollback**
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Option 2: Git Revert**
```bash
git revert HEAD
git push origin main
```

### If RLS Migration Breaks Application

**Rollback Migration:**
```sql
-- Drop all new policies (keep original SELECT/DELETE policies):
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

### If Environment Variable Changed Incorrectly

1. Vercel Dashboard → Settings → Environment Variables
2. Find incorrect variable
3. Click "Edit" → restore previous value
4. Redeploy: Deployments → "Redeploy"

---

## Performance Optimization

### Expected Performance Metrics

**Page Load Times:**
- Landing page: < 1.5s (LCP)
- Dashboard: < 2s (LCP)
- Refinery detail: < 2.5s (LCP)

**API Response Times:**
- GET endpoints: < 200ms (p95)
- POST endpoints: < 500ms (p95)
- Refine operations: 5-30s (depending on AI provider)

### If Performance Degrades

**Check Rate Limiting Overhead:**
```javascript
// Add timing logs to rate limit function:
const start = Date.now();
const result = await rateLimit(userId, 'read');
console.log(`Rate limit check: ${Date.now() - start}ms`);

// Expected: < 50ms with Upstash, < 5ms with in-memory
```

**Check RLS Policy Overhead:**
```sql
-- Analyze slow queries:
EXPLAIN ANALYZE
SELECT * FROM refineries WHERE user_id = '[user-id]';

-- Expected: Index scan on user_id (< 10ms)
```

**Database Indexes (should already exist):**
```sql
-- Verify indexes:
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Critical indexes:
-- refineries: idx_refineries_user_id
-- vault_entries: idx_vault_user
-- messages: idx_messages_refinery_id
-- artifacts: idx_artifacts_refinery_id
```

---

## Support & Resources

**Documentation:**
- [SECURITY.md](SECURITY.md) - Full security documentation
- [SECURITY_SETUP.md](SECURITY_SETUP.md) - Secret management guide
- [DEPLOY_RLS_MIGRATION.md](supabase/DEPLOY_RLS_MIGRATION.md) - Database migration guide

**External Services:**
- Supabase Dashboard: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf
- Vercel Dashboard: https://vercel.com/dashboard
- Upstash Console: https://console.upstash.com

**Security Tools:**
- Security Headers Test: https://securityheaders.com
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- OWASP ZAP: https://www.zaproxy.org

**Report Security Issues:**
- Email: security@your-domain.com (set this up!)
- Response time: < 48 hours

---

**Deployment Checklist Summary:**

- [x] Environment variables configured in Vercel
- [x] Sensitive variables marked as "Sensitive"
- [x] Database RLS migration deployed
- [x] OAuth providers configured
- [x] Upstash Redis connected
- [x] Security headers verified
- [x] Authentication tested
- [x] Authorization tested
- [x] Rate limiting tested
- [x] Encryption verified

**Status:** ✅ Production Ready

**Deployed By:** [Your Name]
**Deployment Date:** [YYYY-MM-DD]
**Next Security Review:** [YYYY-MM-DD + 90 days]

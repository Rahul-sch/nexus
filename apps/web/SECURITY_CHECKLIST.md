# Security Checklist - Quick Reference

**Use this checklist before every production deployment**

---

## Pre-Deployment Checklist

### Secrets & Configuration

- [ ] Verify `.env.local` is in `.gitignore` and not committed
- [ ] Run secret scanner: `docker run --rm -v "$PWD:/repo" trufflesecurity/trufflehog:latest filesystem /repo`
- [ ] Check git history: `git log --all --full-history -- **/.env.local` (should be empty)
- [ ] Verify `VAULT_ENCRYPTION_SECRET` is ≥32 characters
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is marked "Sensitive" in Vercel
- [ ] Verify `UPSTASH_REDIS_REST_TOKEN` is marked "Sensitive" in Vercel
- [ ] Verify `DEV_INLINE_WORKER` is NOT set in production

### Database Security

- [ ] Deploy RLS migration 005 (see `DEPLOY_RLS_MIGRATION.md`)
- [ ] Verify RLS policies exist: `SELECT COUNT(*) FROM pg_policies WHERE schemaname='public'` (expect 20+)
- [ ] Test RLS policy: Try SELECT on refineries without auth (should fail)

### Application Security

- [ ] Run `npm audit --production` (no high/critical vulnerabilities)
- [ ] Verify security headers in `next.config.ts`
- [ ] Test password strength enforcement (weak password should be blocked)
- [ ] Test OAuth redirect validation (no open redirects)

---

## Post-Deployment Verification

### Security Headers (2 minutes)

```bash
curl -I https://your-app.vercel.app | grep -i "strict-transport-security"
```
✅ **Expected:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

```bash
curl -I https://your-app.vercel.app | grep -i "content-security-policy"
```
✅ **Expected:** `Content-Security-Policy: default-src 'self'; ...`

**Or use:** https://securityheaders.com (Grade: A or A+)

### Authentication (3 minutes)

- [ ] Sign up with weak password (`test123`) → Should be blocked
- [ ] Sign up with strong password → Should succeed
- [ ] Test Google OAuth → Should redirect correctly
- [ ] Test GitHub OAuth → Should redirect correctly
- [ ] Verify password strength meter shows real-time feedback

### Authorization (5 minutes)

- [ ] User A creates refinery → Copy ID
- [ ] User B tries to access User A's refinery → Should get 404
- [ ] User A can access their own refinery → Should succeed

**API Test:**
```bash
curl https://your-app.vercel.app/api/refineries/[USER_A_REFINERY_ID] \
  -H "Cookie: [USER_B_SESSION_COOKIE]"
```
✅ **Expected:** `{"error":"Not found"}` (404)

### Rate Limiting (5 minutes)

```bash
# Send 61 requests in 1 minute:
for i in {1..61}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Cookie: [YOUR_SESSION_COOKIE]" \
    https://your-app.vercel.app/api/vault
done | grep -c "429"
```
✅ **Expected:** At least 1 occurrence of `429`

### Encryption (2 minutes)

```sql
-- In Supabase SQL Editor:
SELECT
  provider_type,
  key_hint,
  length(encrypted_api_key) as len
FROM public.vault_entries
LIMIT 1;
```
✅ **Expected:** `encrypted_api_key` is BYTEA (50-200 bytes), not plaintext

---

## Quick Security Test Script

Save as `test-security.sh`:

```bash
#!/bin/bash

APP_URL="https://your-app.vercel.app"
SESSION_COOKIE="" # Fill this in from browser

echo "🔒 Testing Security Headers..."
HSTS=$(curl -s -I $APP_URL | grep -i "strict-transport-security")
if [ ! -z "$HSTS" ]; then
  echo "✅ HSTS enabled"
else
  echo "❌ HSTS missing"
fi

CSP=$(curl -s -I $APP_URL | grep -i "content-security-policy")
if [ ! -z "$CSP" ]; then
  echo "✅ CSP enabled"
else
  echo "❌ CSP missing"
fi

echo ""
echo "🚦 Testing Rate Limiting..."
RATE_LIMITED=0
for i in {1..61}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Cookie: $SESSION_COOKIE" \
    $APP_URL/api/vault)
  if [ "$CODE" = "429" ]; then
    RATE_LIMITED=$((RATE_LIMITED + 1))
  fi
done

if [ $RATE_LIMITED -gt 0 ]; then
  echo "✅ Rate limiting active ($RATE_LIMITED/61 requests blocked)"
else
  echo "❌ Rate limiting not working"
fi

echo ""
echo "Security test complete!"
```

**Usage:**
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## Emergency Response Contacts

### If Service Role Key is Exposed
1. **IMMEDIATE:** Supabase Dashboard → Settings → API → "Reset Service Role Key"
2. Update Vercel environment variables
3. Redeploy immediately
4. Review logs for unauthorized access

### If Vault Encryption Secret is Exposed
1. **DO NOT** change environment variable yet
2. Run re-encryption script (see `SECURITY_SETUP.md`)
3. Update environment variable after re-encryption
4. Notify users to re-validate API keys

### If Security Breach Suspected
1. Check Vercel logs: `vercel logs --prod | grep "429\|401\|403"`
2. Check Supabase logs: Dashboard → Logs → PostgreSQL
3. Review unusual patterns (repeated 404s, rate limits, RLS violations)
4. Document incident in security log
5. Notify affected users if data was accessed

---

## Security Monitoring (Ongoing)

### Daily
- [ ] Check Vercel logs for excessive 429 responses
- [ ] Check for unusual error patterns

### Weekly
- [ ] Review Supabase PostgreSQL logs for errors
- [ ] Run `npm audit` and apply fixes

### Monthly
- [ ] Test security headers: https://securityheaders.com
- [ ] Review and rotate secrets (if >90 days old)

### Quarterly
- [ ] Complete full security review (see `SECURITY.md`)
- [ ] Test authorization bypass scenarios
- [ ] Update security documentation

---

## Security Metrics Dashboard

**Track these metrics:**

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Rate limit 429s | < 1% requests | > 5% | > 10% |
| Auth failures (401) | < 2% requests | > 10% | > 20% |
| RLS violations | 0 | > 0 | > 10 |
| Vault decrypt errors | < 0.1% | > 1% | > 5% |
| Security header grade | A+ | A | < A |

**Setup Monitoring:**
```javascript
// Add to Vercel serverless functions:
export async function middleware(req) {
  const startTime = Date.now();

  // Your existing code...

  // Log metrics:
  if (res.status === 429) {
    console.log('[SECURITY] Rate limit exceeded', {
      path: req.url,
      userId: req.userId,
      ip: req.headers.get('x-forwarded-for')
    });
  }

  if (res.status === 401) {
    console.log('[SECURITY] Unauthorized access attempt', {
      path: req.url,
      ip: req.headers.get('x-forwarded-for')
    });
  }

  return res;
}
```

---

## Quick Links

- **Full Documentation:** [SECURITY.md](SECURITY.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Secret Management:** [SECURITY_SETUP.md](SECURITY_SETUP.md)
- **Database Migration:** [DEPLOY_RLS_MIGRATION.md](supabase/DEPLOY_RLS_MIGRATION.md)

---

**Last Updated:** 2026-01-13
**Next Review:** 2026-04-13 (quarterly)

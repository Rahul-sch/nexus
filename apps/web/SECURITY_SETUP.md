# Security Setup Guide

## 🔐 Critical: Secret Management

### Required Environment Variables

All secrets **MUST** be stored in `.env.local` (which is git-ignored) and **NEVER** committed to the repository.

#### 1. Supabase Service Role Key

**Purpose:** Server-side database access with full privileges
**Risk Level:** 🔴 CRITICAL

```bash
# Generate new key at: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Requirements:**
- ✅ Only use server-side (API routes, server actions)
- ❌ NEVER expose in client code or NEXT_PUBLIC_* variables
- ❌ NEVER log or include in error messages
- 🔄 Rotate immediately if exposed

#### 2. Vault Encryption Secret

**Purpose:** Master key for encrypting user API keys
**Risk Level:** 🔴 CRITICAL

```bash
# Generate with: openssl rand -base64 32
VAULT_ENCRYPTION_SECRET=WDpMUb2ancGWewPLq9jUaofN-70LkFxGRTiEfK5NktE
```

**Security Requirements:**
- ✅ Minimum 32 characters (256-bit security)
- ✅ Use cryptographically secure random generation
- ❌ NEVER change after users have stored API keys (decrypt will fail)
- 🔄 If leaked, all stored API keys are compromised - rotate and re-encrypt all vault entries

**Rotation Procedure (if compromised):**
1. Generate new encryption secret
2. Decrypt all vault entries with old secret
3. Re-encrypt with new secret
4. Update environment variable
5. Deploy immediately
6. Force all users to re-validate API keys

#### 3. Upstash Redis (Production Required)

**Purpose:** Distributed rate limiting
**Risk Level:** 🟡 HIGH

```bash
# Get from: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=https://[cluster].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

**Security Requirements:**
- ✅ REQUIRED for production (in-memory fallback is single-instance only)
- ✅ Use TLS-enabled Redis instance
- ✅ Set reasonable connection limits
- ❌ Do NOT use shared Redis instance across environments

---

## 🚨 Secret Rotation Checklist

### If Service Role Key is Exposed:

1. **Immediately** go to Supabase Dashboard → Settings → API
2. Click "Reset Service Role Key"
3. Update `.env.local` with new key
4. Update Vercel/production environment variables
5. Redeploy application
6. Review database audit logs for unauthorized access

### If Vault Encryption Secret is Exposed:

1. **Immediately** generate new secret: `openssl rand -base64 32`
2. Run vault re-encryption script (see below)
3. Update `.env.local` with new secret
4. Update Vercel/production environment variables
5. Redeploy application
6. Force all users to re-validate their API keys

### Re-encryption Script (emergency use only)

```typescript
// scripts/rotate-vault-encryption.ts
import { createAdminClient } from '@/lib/supabase/server';
import { decrypt, encrypt } from '@/lib/vault/server';

const OLD_SECRET = process.env.OLD_VAULT_SECRET!;
const NEW_SECRET = process.env.VAULT_ENCRYPTION_SECRET!;

async function rotateVaultEncryption() {
  const supabase = createAdminClient();

  // Fetch all vault entries
  const { data: entries, error } = await supabase
    .from('vault_entries')
    .select('*');

  if (error) throw error;

  for (const entry of entries) {
    try {
      // Decrypt with old secret
      const decrypted = decrypt(entry.encrypted_api_key, entry.encrypted_dek, OLD_SECRET);

      // Re-encrypt with new secret
      const { encryptedData, encryptedDek } = encrypt(decrypted, NEW_SECRET);

      // Update database
      await supabase
        .from('vault_entries')
        .update({
          encrypted_api_key: encryptedData,
          encrypted_dek: encryptedDek,
        })
        .eq('id', entry.id);

      console.log(`✓ Rotated encryption for entry ${entry.id}`);
    } catch (err) {
      console.error(`✗ Failed to rotate entry ${entry.id}:`, err);
    }
  }

  console.log('Vault encryption rotation complete');
}

rotateVaultEncryption();
```

**Usage:**
```bash
OLD_VAULT_SECRET=<old-secret> VAULT_ENCRYPTION_SECRET=<new-secret> tsx scripts/rotate-vault-encryption.ts
```

---

## 🔒 Deployment Security Checklist

### Vercel Environment Variables Setup

1. Go to Vercel Dashboard → Project → Settings → Environment Variables

2. Add the following **Production** variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL        = https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY       = eyJhbGciOiJIUzI1NiIs... (SENSITIVE)
   VAULT_ENCRYPTION_SECRET         = [32+ char secret] (SENSITIVE)
   UPSTASH_REDIS_REST_URL          = https://[cluster].upstash.io
   UPSTASH_REDIS_REST_TOKEN        = [token] (SENSITIVE)
   ```

3. **DO NOT** set `DEV_INLINE_WORKER` in production

4. Verify sensitive variables are marked as "Sensitive" (hidden from logs)

### Pre-Deployment Security Validation

```bash
# 1. Verify no secrets in git history
git log --all --full-history --source -- **/.env.local

# 2. Check for accidentally committed secrets
git grep -i "service_role" -- ':!*.md'
git grep -i "VAULT_ENCRYPTION_SECRET" -- ':!*.example' ':!*.md'

# 3. Validate .gitignore coverage
git check-ignore .env.local
# Should output: .env.local (confirming it's ignored)

# 4. Scan for hardcoded secrets (using truffleHog or similar)
docker run --rm -v "$PWD:/repo" trufflesecurity/trufflehog:latest filesystem /repo
```

---

## 🛡️ Environment Variable Security Best Practices

### 1. Naming Conventions

✅ **CORRECT:**
```bash
SUPABASE_SERVICE_ROLE_KEY=...     # Server-side only
VAULT_ENCRYPTION_SECRET=...        # Server-side only
UPSTASH_REDIS_REST_TOKEN=...       # Server-side only
```

❌ **WRONG:**
```bash
NEXT_PUBLIC_SERVICE_ROLE_KEY=...   # Exposed to client!
NEXT_PUBLIC_ENCRYPTION_SECRET=...  # Exposed to client!
```

**Rule:** Any variable prefixed with `NEXT_PUBLIC_` is **bundled into the client JavaScript** and visible to anyone.

### 2. Validation on Startup

The application validates required secrets on startup (see `lib/env.ts`):

```typescript
// This runs at build time and catches missing secrets early
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VAULT_ENCRYPTION_SECRET',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 3. Secret Storage Options (Beyond Environment Variables)

For enhanced security, consider external secret managers:

| Solution | Use Case | Security Level |
|----------|----------|----------------|
| **Environment Variables** | Development, simple deployments | 🟡 Medium |
| **AWS Secrets Manager** | AWS-hosted production | 🟢 High |
| **Azure Key Vault** | Azure-hosted production | 🟢 High |
| **HashiCorp Vault** | Multi-cloud, enterprise | 🟢 High |
| **Vercel Environment Variables** | Vercel deployments | 🟡 Medium |

**Migration Path to External KMS:**
1. Store `VAULT_ENCRYPTION_SECRET` in AWS Secrets Manager
2. Update vault encryption/decryption functions to fetch from KMS
3. Use IAM roles for authentication (no credentials in env vars)
4. Enable automatic secret rotation

---

## 🔍 Security Monitoring

### 1. Secret Exposure Detection

Set up alerts for accidental secret exposure:

```bash
# GitHub Secret Scanning (automatic for public repos)
# Enable at: Settings → Code security and analysis → Secret scanning

# Pre-commit hook to prevent secrets
npm install --save-dev @commitlint/cli husky
npx husky add .husky/pre-commit "npm run check-secrets"
```

Add to `package.json`:
```json
{
  "scripts": {
    "check-secrets": "git diff --cached | grep -i 'service_role\\|encryption_secret' && exit 1 || exit 0"
  }
}
```

### 2. Environment Variable Audit Log

Log when environment variables are loaded (without values):

```typescript
// lib/env.ts
console.log('[Security] Environment variables loaded:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasVaultSecret: !!process.env.VAULT_ENCRYPTION_SECRET,
  hasRedis: !!process.env.UPSTASH_REDIS_REST_URL,
  environment: process.env.NODE_ENV,
});
```

### 3. Secret Usage Alerts

Monitor for suspicious patterns:
- Service role key used in client code (should never happen)
- Vault decryption failures (possible tampering or key mismatch)
- Rate limit exceeded (possible brute force)

---

## 📝 Quick Reference

### Generate New Secrets

```bash
# Vault Encryption Secret (32 bytes = 256-bit)
openssl rand -base64 32

# Alternative with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Verify length (must be ≥32 chars)
echo -n "your-secret" | wc -c
```

### Validate Current Setup

```bash
# Check environment variables are loaded
npm run dev
# Look for: "[Security] Environment variables loaded: ..."

# Test vault encryption
curl -X POST http://localhost:3000/api/vault \
  -H "Content-Type: application/json" \
  -d '{"provider_type":"anthropic","api_key":"sk-ant-test123"}' \
  -b "cookie-from-browser"

# Should return 201 with encrypted vault entry
```

---

## 🚨 Incident Response Plan

### If a Secret is Leaked:

1. **IMMEDIATE (within 5 minutes):**
   - Rotate the compromised secret in Supabase/Upstash
   - Update production environment variables
   - Deploy immediately

2. **SHORT TERM (within 1 hour):**
   - Review access logs for unauthorized usage
   - Identify scope of compromise (which data was accessed)
   - Notify affected users if data was exfiltrated

3. **LONG TERM (within 24 hours):**
   - Implement additional monitoring
   - Review and improve secret management practices
   - Document incident in security log
   - Consider migrating to external KMS

### Support Contacts

- **Supabase Support:** https://supabase.com/dashboard/support
- **Vercel Support:** https://vercel.com/help
- **Upstash Support:** https://upstash.com/docs/redis/support

---

**Last Updated:** 2026-01-13
**Next Review:** Every 90 days or after security incident

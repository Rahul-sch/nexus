# ⚡ QUICK START - Deploy in 5 Minutes

## Before You Deploy - Critical Steps! ⚠️

### Step 1: Apply Database Migration (2 min)

**You MUST do this first!**

1. Open: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/sql/new
2. Copy entire file: `apps/web/supabase/migrations/005_rls_insert_update_policies.sql`
3. Paste into SQL Editor → Click "Run"
4. Should see: ✅ "Success. No rows returned"

### Step 2: Set Environment Variables in Vercel (3 min)

1. Go to: https://vercel.com/dashboard
2. Find your project → Settings → Environment Variables
3. Add these (copy-paste from below):

```
# Public variables:
NEXT_PUBLIC_SUPABASE_URL=https://ztmlfiyqeqdbsyboilmf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxmaXlxZXFkYnN5Ym9pbG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ3MDMsImV4cCI6MjA4Mzg5MDcwM30.BagjK166_Y226X6Ipm-R8oopp3IGxcZZCAl4GC7jm98

# Sensitive variables (CHECK THE "SENSITIVE" BOX!):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxmaXlxZXFkYnN5Ym9pbG1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDcwMywiZXhwIjoyMDgzODkwNzAzfQ.TNhwEcD-gR8eSFvkeSBeAltMxJ4gQm4I7VO_mt0409Q

VAULT_ENCRYPTION_SECRET=WDpMUb2ancGWewPLq9jUaofN-70LkFxGRTiEfK5NktE
```

**Important:**
- Mark `SUPABASE_SERVICE_ROLE_KEY` as SENSITIVE ✅
- Mark `VAULT_ENCRYPTION_SECRET` as SENSITIVE ✅
- Apply to "Production" AND "Preview" environments

---

## Deploy Now! 🚀

### Option 1: Automatic (if GitHub connected to Vercel)
Your app is already deploying! Check:
https://vercel.com/dashboard → Deployments

### Option 2: Manual via CLI
```bash
cd apps/web
vercel --prod
```

Follow the prompts:
- Project name: (press Enter for default)
- Link to existing project? → Yes (if you have one) or No (create new)
- Settings correct? → Yes

---

## Test Your Deployment ✅

### 1. Visit Your App
Open the URL Vercel gives you (something like: `https://nexus-xxx.vercel.app`)

### 2. Test Password Strength 💪
1. Click "Sign Up"
2. Try password: `test123`
   - ❌ Should be BLOCKED (submit button disabled)
   - 🔴 Shows "Very Weak"
3. Try password: `MySecure$Pass123!`
   - ✅ Should be ALLOWED (submit button enabled)
   - 🟢 Shows "Very Strong"

### 3. Create Account & Login
1. Sign up with strong password
2. Check email for confirmation
3. Confirm account
4. Login → Should see dashboard!

---

## Show Your Friends! 🎉

**Cool things to demonstrate:**

1. **🔒 Security Features**
   - "Try signing up with 'password123'" → BLOCKED!
   - "Now watch this strong password work" → ✅

2. **🚀 OAuth Login**
   - "Click Continue with Google" → Smooth!

3. **🤖 AI Prompt Refinement**
   - Enter rough prompt
   - Watch 4 AI agents collaborate
   - Get polished result!

4. **🔐 Encrypted API Keys**
   - Add your Anthropic/OpenAI key
   - "It's encrypted in the database, not plaintext"

5. **⚡ Performance**
   - "Check out these security headers!"
   - Visit: https://securityheaders.com
   - Enter your app URL
   - Show **A rating**!

---

## Troubleshooting 🔧

**"Build failed"**
→ Check environment variables are set correctly in Vercel

**"Database connection error"**
→ Make sure you applied the RLS migration (Step 1)

**"Can't sign up"**
→ Check email confirmation is enabled in Supabase

**"Rate limit error"**
→ Normal in dev without Redis - works fine for testing!

---

## Your App Has:

✅ Enterprise-grade security (OWASP Top 10)
✅ Password strength enforcement
✅ Rate limiting (prevents abuse)
✅ Database encryption (RLS + AES-256)
✅ Security headers (HSTS, CSP, etc.)
✅ OAuth support (Google, GitHub)

**Ready to impress!** 🌟

---

## Need More Help?

- **Full Guide**: See `DEPLOY_NOW.md`
- **Security Docs**: See `apps/web/SECURITY.md`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

---

**That's it! You're live! 🚀**

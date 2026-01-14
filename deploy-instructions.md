# DEPLOYMENT INSTRUCTIONS - Follow These Steps

## What I've Done ✅

1. ✅ Set all 4 environment variables in Vercel (both `web` and `nexus` projects)
2. ✅ Fixed the monorepo build configuration
3. ✅ Pushed all changes to GitHub

## The Issue

Your project is a pnpm monorepo. Vercel CLI keeps failing because it needs special configuration to:
- Use `pnpm install` (not npm)
- Build from the monorepo root
- Deploy the `apps/web` subfolder

## SIMPLEST SOLUTION - Do This Now! 🚀

### Step 1: Go to Vercel Dashboard
https://vercel.com/rahul-schs-projects/web/settings/general

### Step 2: Edit Build Settings
Scroll down and click **"Edit"** next to "Build & Development Settings"

### Step 3: Set These Values
```
Root Directory: apps/web
Install Command: cd ../.. && pnpm install
Build Command: cd ../.. && pnpm turbo run build --filter=web
Node.js Version: 20.x
```

### Step 4: Save and Redeploy
1. Click **Save**
2. Go to: https://vercel.com/rahul-schs-projects/web/deployments
3. Click **Redeploy** on the latest deployment
4. Uncheck "Use existing Build Cache"
5. Click **Redeploy**

---

## Alternative: Import Fresh from GitHub

If the above doesn't work:

1. Go to: https://vercel.com/new
2. Import your GitHub repo: `Rahul-sch/nexus`
3. Set Root Directory: `apps/web`
4. Deploy!

Your environment variables are already set, so it will work immediately!

---

## Your Environment Variables (Already Set ✅)

On project `web`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (sensitive)
- VAULT_ENCRYPTION_SECRET (sensitive)

All in Production & Preview environments!

---

Once deployed, your app will be live at:
https://web-rahul-schs-projects.vercel.app

Test it with:
1. Try weak password "test123" - should be blocked!
2. Try strong password - should work!
3. Sign up, confirm email, login!

🎉 You're almost there!

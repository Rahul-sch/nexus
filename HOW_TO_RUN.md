# How to Run Nexus

Simple guide to start the Nexus application from scratch.

---

## Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase project set up
- API keys ready (Anthropic + OpenAI)

---

## Step 1: Install Dependencies

```bash
cd c:/Users/rahul/Desktop/Prompty/nexus
pnpm install
```

This installs all packages for the monorepo (web app + orchestration + shared).

---

## Step 2: Verify Environment Variables

Check that `.env.local` exists in `apps/web/` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VAULT_ENCRYPTION_SECRET=minimum-32-character-secret
DEV_INLINE_WORKER=true
```

---

## Step 3: Build the Project

```bash
pnpm build
```

This compiles:
- TypeScript packages (orchestration + shared)
- Next.js web app

Takes ~20-30 seconds.

---

## Step 4: Start Development Server

```bash
pnpm dev
```

This starts:
- Next.js dev server (usually port 3001 if 3000 is taken)
- TypeScript watch mode for packages
- Hot reload enabled

**Expected output:**
```
✓ Ready in 2.7s
- Local:   http://localhost:3001
```

---

## Step 5: Open in Browser

Navigate to: **http://localhost:3001**

You should see:
- Hero landing page with animated gradient orbs
- "Transform Prompts Into Precision" heading
- Get Started and Try Demo buttons

---

## Pages to Test

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Main dashboard (requires login) |
| `/composer` | Split-screen composer with AI council |
| `/history` | Refinement history |

---

## Troubleshooting

**Port already in use:**
```
⚠ Port 3000 is in use, using port 3001 instead
```
→ This is normal, app will run on 3001.

**Build errors:**
```bash
# Clean and rebuild
rm -rf node_modules .next
pnpm install
pnpm build
```

**Database not connected:**
- Verify Supabase credentials in `.env.local`
- Check Supabase project is not paused

**TypeScript errors:**
```bash
# Rebuild packages
cd packages/orchestration && pnpm build
cd packages/shared && pnpm build
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal, or:

```bash
# Kill all Node processes
powershell -Command "Stop-Process -Name node -Force"
```

---

## Quick Start (One Command)

From fresh start:

```bash
cd c:/Users/rahul/Desktop/Prompty/nexus && pnpm install && pnpm build && pnpm dev
```

Then open: http://localhost:3001

---

**That's it! Nexus should now be running.**

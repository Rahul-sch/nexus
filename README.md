# Nexus - AI Prompt Refinement Platform

> Transform vague ideas into precision-engineered prompts using a council of AI agents.

---

## 🎈 For a 5-Year-Old

Imagine you have 4 robot friends who help you write better stories:

1. **Clarifier** (Blue Robot) - Asks questions like "What do you mean?"
2. **Drafter** (Purple Robot) - Writes the first story
3. **Critic** (Cyan Robot) - Says "This part could be better!"
4. **Finalizer** (Green Robot) - Makes the final perfect story

You type what you want, and these 4 robots work together like a team to make it amazing! They talk to each other, fix mistakes, and give you the best result.

---

## 👨‍💻 For Senior Developers

**Nexus** is a production-ready AI orchestration platform that refines user prompts through a multi-agent debate system built on LangGraph.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Input Prompt                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │   Clarifier    │ ← Analyzes prompt, asks questions
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │    Drafter     │ ← Generates initial refinement
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │     Critic     │ ← Reviews & suggests improvements
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   Finalizer    │ ← Produces final optimized prompt
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │  Final Output  │
            └────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5.7.3
- Framer Motion 12.26.2 (animations)
- Tailwind CSS (styling)

**Backend:**
- Next.js API Routes (Node.js runtime)
- Supabase (Auth + PostgreSQL + RLS)
- LangGraph 0.2.74 (agent orchestration)

**AI Providers:**
- Anthropic Claude 3.5 Sonnet (clarifier, finalizer)
- OpenAI GPT-4o (drafter)
- OpenAI GPT-4o-mini (critic)

**Security:**
- AES-256-GCM encryption (envelope encryption for API keys)
- Row Level Security (RLS) policies
- Rate limiting (Upstash Redis + in-memory fallback)
- Zod input validation
- Comprehensive security headers (CSP, HSTS, etc.)

### Project Structure

```
nexus/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App router pages
│       │   ├── page.tsx        # Landing page
│       │   ├── dashboard/      # Main dashboard
│       │   ├── composer/       # Split-screen refinery UI
│       │   ├── history/        # Refinement history
│       │   └── api/            # API routes
│       ├── components/         # React components
│       │   ├── landing/        # Landing page sections
│       │   ├── council/        # Agent network visualization
│       │   └── ui/             # Reusable UI components
│       ├── lib/                # Utilities
│       │   ├── vault/          # API key encryption
│       │   ├── auth.ts         # Authentication helpers
│       │   ├── rate-limit.ts   # Rate limiting
│       │   └── logging.ts      # Secure logging with redaction
│       └── supabase/
│           └── migrations/     # Database schema
├── packages/
│   ├── orchestration/          # LangGraph agent logic
│   │   ├── agents/             # Individual agent definitions
│   │   ├── graph.ts            # State graph orchestration
│   │   └── state.ts            # Shared state type
│   └── shared/                 # Shared types & schemas
│       └── schemas.ts          # Zod validation schemas
└── turbo.json                  # Monorepo configuration
```

### Key Features

**1. Multi-Agent Refinement Pipeline**
- 4-stage iterative refinement (clarify → draft → critique → finalize)
- Configurable max iterations (1-3) and temperature (0-1.5)
- State machine orchestration via LangGraph
- Real-time status updates via polling

**2. Secure API Key Management**
- Client-side encrypted storage (never sent to server in plaintext)
- Server-side envelope encryption (AES-256-GCM)
- Per-user, per-provider key isolation
- Key hint display (last 4 chars only)

**3. Split-Screen Composer**
- Left panel: Input/output with collapsible config
- Right panel: Animated council network visualization
- Live agent status indicators during processing
- Real-time token usage tracking

**4. Production-Grade Security**
- ✅ 0 dependency vulnerabilities (audited)
- ✅ All API routes protected with auth + rate limiting
- ✅ RLS policies on all database tables
- ✅ Credential redaction in logs (10+ patterns)
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Input validation with Zod schemas
- ✅ User quota enforcement (daily/monthly token limits)

**5. User Experience**
- Animated landing page with gradient orbs
- Interactive workflow visualization
- Refinement history with filters & search
- Mobile-responsive design
- Toast notifications for feedback

### Database Schema

**Core Tables:**
- `users` - User profiles with quotas
- `vault_entries` - Encrypted API keys (AES-256-GCM)
- `refineries` - Refinement jobs with status tracking
- `messages` - Agent conversation history
- `artifacts` - Structured outputs (drafts, critiques, finals)

**Security:**
- All tables have RLS policies (`auth.uid()` checks)
- Foreign keys with CASCADE deletes
- CHECK constraints on enums
- Unique constraints on `(user_id, provider_type)`

### API Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/vault` | POST | ✅ | 20/min | Store encrypted API key |
| `/api/vault` | GET | ✅ | 20/min | Retrieve user's keys |
| `/api/refineries` | POST | ✅ | 10/min | Create refinement job |
| `/api/refineries` | GET | ✅ | 100/min | List user's refineries |
| `/api/refineries/[id]` | GET | ✅ | 100/min | Get refinery details |
| `/api/refineries/[id]` | DELETE | ✅ | 100/min | Delete refinery |

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (min 32 chars)
VAULT_ENCRYPTION_SECRET=your-secret-key-here

# Rate Limiting (optional, falls back to in-memory)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Development
DEV_INLINE_WORKER=true
```

### Quick Start

**Option 1: Run script (recommended)**
```bash
.\run.bat          # Windows
./run.sh           # Linux/Mac
```

**Option 2: Manual**
```bash
pnpm install       # Install dependencies
pnpm build         # Build packages + Next.js
pnpm dev           # Start dev server
```

Open **http://localhost:3000**

### Testing

```bash
pnpm audit         # Dependency security scan
pnpm type-check    # TypeScript validation
pnpm lint          # ESLint check
```

### Deployment

**Production Checklist:**
- [ ] Remove `DEV_INLINE_WORKER=true`
- [ ] Configure Upstash Redis for rate limiting
- [ ] Set up Supabase database backups
- [ ] Enable error monitoring (Sentry)
- [ ] Test CSP headers (may need style adjustments)

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for full security review.

---

## 📊 Performance Metrics

- **Build Time:** ~20-30s
- **Startup Time:** ~3-5s
- **API Response:** <200ms (cached keys)
- **Refinement Time:** ~30-90s (depends on iterations)
- **Token Usage:** ~5K-15K per refinement

---

## 🔒 Security

- **Encryption:** AES-256-GCM with envelope encryption
- **Authentication:** Supabase Auth (JWT sessions)
- **Authorization:** Row Level Security (RLS) policies
- **Rate Limiting:** Sliding window (Upstash Redis)
- **Input Validation:** Zod schemas (all endpoints)
- **Logging:** Credential redaction (10+ patterns)
- **Headers:** CSP, HSTS, X-Frame-Options, etc.

**Security Audit Status:** ✅ Production Ready (see `SECURITY_AUDIT.md`)

---

## 📄 License

Proprietary - All Rights Reserved

---

**Built with ❤️ by Rahul**

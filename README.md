<div align="center">

# Nexus - AI Prompt Refinement Platform

**Transform vague ideas into precision-engineered prompts using a council of AI agents.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://nexusprompty.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

[Live Demo](https://nexusprompty.vercel.app) · [Features](#-features) · [Getting Started](#-quick-start) · [Security](#-security)

</div>

---

## Screenshots

<!--
TO ADD SCREENSHOTS:
1. Take screenshots of each page
2. Save them in docs/images/ folder
3. Replace the placeholder URLs below
-->

### Landing Page
![Landing Page](docs/images/landing.png)
*Beautiful landing page with animated AI council visualization*

### Dashboard
![Dashboard](docs/images/dashboard.png)
*User dashboard showing refinement history and quick actions*

### Prompt Composer
![Composer](docs/images/composer.png)
*Split-screen composer with live AI agent network visualization*

### Password Security
![Password Strength](docs/images/password-strength.png)
*Real-time password strength validation with visual feedback*

### Sign Up Flow
![Sign Up](docs/images/signup.png)
*Secure sign-up with OAuth options and password requirements*

---

## What is Nexus?

Nexus is an AI-powered prompt engineering platform that uses a **council of 4 specialized AI agents** to collaboratively refine your prompts:

| Agent | Role | Model |
|-------|------|-------|
| **Clarifier** | Identifies ambiguities, asks targeted questions | Claude 3.5 Sonnet |
| **Drafter** | Creates refined prompt drafts | GPT-4o |
| **Critic** | Evaluates drafts against quality criteria | GPT-4o-mini |
| **Finalizer** | Synthesizes feedback into polished prompts | Claude 3.5 Sonnet |

### How It Works

```
User Input → Clarifier → Drafter → Critic → Finalizer → Perfect Prompt
                ↑                      |
                └──────────────────────┘
                   (Iterative refinement)
```

---

## Features

### Core Features
- **Multi-Agent Refinement** - 4 AI agents work together to perfect your prompts
- **Real-time Visualization** - Watch agents collaborate in an animated network
- **Iteration Control** - Configure 1-3 refinement iterations
- **Provider Flexibility** - Bring your own API keys (Anthropic, OpenAI)

### Security Features
- **Password Strength Enforcement** - 12+ characters with complexity requirements
- **AES-256-GCM Encryption** - Your API keys are never stored in plaintext
- **Rate Limiting** - Prevents abuse (10-100 req/min by endpoint)
- **Row Level Security** - 20+ database policies protect your data
- **Security Headers** - HSTS, CSP, X-Frame-Options, and more

### User Experience
- **OAuth Login** - Sign in with Google or GitHub
- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Mode** - Automatic theme detection
- **History & Search** - Find and reuse past refinements

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 10+
- Supabase account
- OpenAI and/or Anthropic API keys

### Installation

```bash
# Clone the repository
git clone https://github.com/Rahul-sch/nexus.git
cd nexus

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (required, min 32 chars)
VAULT_ENCRYPTION_SECRET=your-secret-key-min-32-characters

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.1, React 19, TypeScript 5.7, Tailwind CSS |
| **Backend** | Next.js API Routes, LangGraph 0.2 |
| **Database** | Supabase (PostgreSQL + Auth + RLS) |
| **AI Providers** | Anthropic Claude, OpenAI GPT-4 |
| **Security** | AES-256-GCM, Upstash Redis, Zod |
| **Deployment** | Vercel |

---

## Project Structure

```
nexus/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App router pages
│       │   ├── page.tsx        # Landing page
│       │   ├── dashboard/      # User dashboard
│       │   ├── composer/       # Prompt composer
│       │   ├── signup/         # Sign up with password strength
│       │   └── api/            # API routes
│       ├── components/         # React components
│       │   ├── landing/        # Landing page sections
│       │   ├── council/        # Agent network visualization
│       │   └── ui/             # Reusable UI components
│       └── lib/                # Utilities
│           ├── vault/          # API key encryption
│           ├── password-strength.ts  # Password validation
│           └── rate-limit.ts   # Rate limiting
├── packages/
│   ├── orchestration/          # LangGraph agent logic
│   └── shared/                 # Shared types & schemas
└── docs/
    └── images/                 # README screenshots
```

---

## Security

Nexus implements enterprise-grade security:

| Feature | Implementation |
|---------|----------------|
| **Password Policy** | 12+ chars, uppercase, lowercase, number, special char |
| **Encryption** | AES-256-GCM envelope encryption for API keys |
| **Authentication** | Supabase Auth with OAuth (Google, GitHub) |
| **Authorization** | Row Level Security (20+ policies) |
| **Rate Limiting** | Sliding window (Upstash Redis) |
| **Input Validation** | Zod schemas on all endpoints |
| **Security Headers** | HSTS, CSP, X-Frame-Options, COEP, COOP |

### Security Rating

Test your deployment: [securityheaders.com](https://securityheaders.com/?q=nexusprompty.vercel.app)

---

## API Endpoints

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| `/api/vault` | POST | 20/min | Store encrypted API key |
| `/api/vault` | GET | 60/min | Retrieve user's keys |
| `/api/refineries` | POST | 10/min | Create refinement job |
| `/api/refineries` | GET | 60/min | List refineries |
| `/api/refineries/[id]` | GET | 60/min | Get refinery details |
| `/api/refineries/[id]` | DELETE | 60/min | Delete refinery |

All endpoints require authentication.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy!

See [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for detailed instructions.

### Production Checklist

- [ ] Set all environment variables
- [ ] Apply database migrations
- [ ] Configure OAuth providers in Supabase
- [ ] Test password strength enforcement
- [ ] Verify security headers

---

## Performance

| Metric | Value |
|--------|-------|
| Build Time | ~15-20s |
| Cold Start | ~2-3s |
| API Response | <200ms |
| Refinement Time | 30-90s |

---

## Contributing

This is a private project. Contact [Rahul](https://github.com/Rahul-sch) for collaboration opportunities.

---

## License

Proprietary - All Rights Reserved

---

<div align="center">

**Built with love by Rahul**

[Live Demo](https://nexusprompty.vercel.app) · [GitHub](https://github.com/Rahul-sch/nexus)

</div>

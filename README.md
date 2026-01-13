# Nexus

**AI-Powered Prompt Refinement Platform**

Nexus is a multi-agent system that transforms rough prompts into production-ready instructions through iterative refinement. It employs a council of specialized AI agents that collaborate to clarify, draft, critique, and finalize prompts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXUS PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Next.js   │    │  Supabase   │    │    LangGraph        │  │
│  │   Frontend  │◄──►│  (Auth/DB)  │◄──►│  Orchestration      │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                               │                  │
│                     ┌─────────────────────────┼─────────────┐   │
│                     │         AI COUNCIL      ▼             │   │
│                     │  ┌───────────┐  ┌───────────┐         │   │
│                     │  │ Clarifier │─►│  Drafter  │         │   │
│                     │  └───────────┘  └─────┬─────┘         │   │
│                     │        ▲              │               │   │
│                     │        │              ▼               │   │
│                     │  ┌───────────┐  ┌───────────┐         │   │
│                     │  │ Finalizer │◄─│  Critic   │◄──┐     │   │
│                     │  └───────────┘  └───────────┘   │     │   │
│                     │                       │         │     │   │
│                     │                       └─────────┘     │   │
│                     │                    (iteration loop)   │   │
│                     └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Council

| Agent | Model | Role |
|-------|-------|------|
| **Clarifier** | Claude 3.5 Sonnet | Identifies ambiguities, generates clarifying questions |
| **Drafter** | GPT-4o | Produces refined prompt drafts |
| **Critic** | Claude 3.5 Sonnet | Evaluates drafts against criteria, provides scores |
| **Finalizer** | Claude 3.5 Sonnet | Synthesizes feedback into final polished prompt |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js runtime
- **Database**: Supabase (PostgreSQL + Realtime)
- **Orchestration**: LangGraph for state machine workflow
- **AI Providers**: Anthropic Claude, OpenAI GPT
- **Build System**: Turborepo, pnpm workspaces

## Project Structure

```
nexus/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App router pages & API routes
│       │   ├── api/            # REST API endpoints
│       │   │   ├── vault/      # API key management
│       │   │   ├── refineries/ # CRUD operations
│       │   │   └── refine/     # Orchestration triggers
│       │   ├── composer/       # New refinement page
│       │   ├── history/        # Refinement history
│       │   └── refinery/[id]/  # Detail view
│       ├── components/         # React components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Server utilities
│
├── packages/
│   ├── orchestration/          # LangGraph agent system
│   │   ├── src/
│   │   │   ├── providers/      # AI provider adapters
│   │   │   ├── nodes/          # Agent implementations
│   │   │   ├── graph.ts        # State machine definition
│   │   │   └── worker.ts       # Execution engine
│   │   └── package.json
│   │
│   └── shared/                 # Shared types & schemas
│       └── src/
│           ├── types.ts        # TypeScript interfaces
│           └── schemas.ts      # Zod validation schemas
│
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # Workspace definition
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (or local instance)
- API keys: Anthropic, OpenAI

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nexus.git
cd nexus

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Encryption
VAULT_ENCRYPTION_SECRET=minimum-32-character-secret-key

# Optional: Rate limiting
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Database Setup

Apply migrations to your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL files in order:
# 1. apps/web/supabase/migrations/001_users.sql
# 2. apps/web/supabase/migrations/002_vault.sql
# 3. apps/web/supabase/migrations/003_refineries.sql
# 4. apps/web/supabase/migrations/004_rls_policies.sql
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/vault` | Store encrypted API key |
| `GET` | `/api/vault` | List stored providers |
| `DELETE` | `/api/vault/[provider]` | Remove API key |
| `POST` | `/api/vault/[provider]/validate` | Validate API key |
| `POST` | `/api/refineries` | Create new refinery |
| `GET` | `/api/refineries` | List refineries (paginated) |
| `GET` | `/api/refineries/[id]` | Get refinery details |
| `DELETE` | `/api/refineries/[id]` | Delete refinery |
| `POST` | `/api/refine/start` | Start refinement process |
| `POST` | `/api/refine/cancel` | Cancel running refinement |
| `POST` | `/api/refine/resume` | Resume with user answers |

## Security

- **Envelope Encryption**: API keys encrypted with AES-256-GCM using per-key DEKs
- **Row Level Security**: Supabase RLS policies enforce data isolation
- **Rate Limiting**: Configurable limits per user/endpoint
- **Input Validation**: Zod schemas on all API inputs
- **CSP Headers**: Strict Content Security Policy

## License

MIT

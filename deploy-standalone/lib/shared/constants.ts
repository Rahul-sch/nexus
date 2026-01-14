// Provider constants
export const PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  XAI: 'xai',
  DEEPSEEK: 'deepseek',
} as const;

// Default models per provider
export const DEFAULT_MODELS = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  xai: 'grok-beta',
  deepseek: 'deepseek-chat',
} as const;

// Agent configuration
export const AGENT_CONFIG = {
  clarifier: {
    provider: PROVIDERS.ANTHROPIC,
    temperature: 0.3,
    maxTokens: 2000,
  },
  drafter: {
    provider: PROVIDERS.OPENAI,
    temperature: 0.7,
    maxTokens: 4000,
  },
  critic: {
    provider: PROVIDERS.XAI,
    temperature: 0.5,
    maxTokens: 3000,
  },
  finalizer: {
    provider: PROVIDERS.ANTHROPIC,
    temperature: 0.4,
    maxTokens: 4000,
  },
} as const;

// Limits
export const LIMITS = {
  MAX_PROMPT_LENGTH: 50000,
  MAX_ITERATIONS: 3,
  MAX_TOKENS_PER_RUN: 50000,
  DEFAULT_DAILY_TOKEN_LIMIT: 100000,
  DEFAULT_MONTHLY_TOKEN_LIMIT: 3000000,
  RATE_LIMIT_REFINE: 10, // per minute
  RATE_LIMIT_VAULT: 20, // per minute
  RATE_LIMIT_DEFAULT: 100, // per minute
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  pending: '#6e6e73',
  queued: '#ff9f0a',
  running: '#0066ff',
  completed: '#34c759',
  failed: '#ff3b30',
  cancelled: '#6e6e73',
  awaiting_user: '#ff9f0a',
} as const;

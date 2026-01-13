// Rate limiting using Upstash Redis
// For development without Redis, falls back to in-memory limiting

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

const LIMITS = {
  refine: { requests: 10, windowMs: 60000 },    // 10 per minute
  vault: { requests: 20, windowMs: 60000 },     // 20 per minute
  default: { requests: 100, windowMs: 60000 },  // 100 per minute
} as const;

async function memoryRateLimit(
  identifier: string,
  endpoint: keyof typeof LIMITS
): Promise<RateLimitResult> {
  const config = LIMITS[endpoint];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    memoryStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: now + config.windowMs,
    };
  }

  if (entry.count >= config.requests) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    limit: config.requests,
    remaining: config.requests - entry.count,
    reset: entry.resetTime,
  };
}

async function upstashRateLimit(
  identifier: string,
  endpoint: keyof typeof LIMITS
): Promise<RateLimitResult> {
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const config = LIMITS[endpoint];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, `${config.windowMs} ms`),
    prefix: `ratelimit:${endpoint}`,
  });

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  };
}

export async function rateLimit(
  identifier: string,
  endpoint: 'refine' | 'vault' | 'default' = 'default'
): Promise<RateLimitResult> {
  // Use Upstash if configured, otherwise fall back to memory
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await upstashRateLimit(identifier, endpoint);
    } catch (error) {
      console.warn('Upstash rate limit failed, falling back to memory:', error);
      return memoryRateLimit(identifier, endpoint);
    }
  }

  return memoryRateLimit(identifier, endpoint);
}

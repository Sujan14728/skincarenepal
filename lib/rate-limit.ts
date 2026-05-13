import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimiterLike = {
  limit: (_identifier: string) => Promise<LimitResult>;
};

const hasUpstashEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const fallbackLimit = async (): Promise<LimitResult> => ({
  success: true,
  limit: 0,
  remaining: 0,
  reset: Date.now()
});

// Redis client over HTTP works in middleware/edge runtime.
const redis = hasUpstashEnv ? Redis.fromEnv() : null;

// Enable analytics only when explicitly requested via UPSTASH_ANALYTICS=true
const enableAnalytics =
  hasUpstashEnv && process.env.UPSTASH_ANALYTICS === 'true';

const remoteRatelimiter = hasUpstashEnv
  ? new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(120, '1 m'),
      analytics: enableAnalytics,
      prefix: 'sknc:middleware'
    })
  : null;

const UPSTASH_RETRY_COOLDOWN_MS = 60_000;
let upstashDisabledUntil = 0;

export const globalRatelimit: RateLimiterLike = {
  async limit(_identifier: string): Promise<LimitResult> {
    if (!remoteRatelimiter) return fallbackLimit();

    if (Date.now() < upstashDisabledUntil) {
      return fallbackLimit();
    }

    try {
      return await remoteRatelimiter.limit(_identifier);
    } catch {
      // Temporary circuit breaker avoids repeated slow failures.
      upstashDisabledUntil = Date.now() + UPSTASH_RETRY_COOLDOWN_MS;
      return fallbackLimit();
    }
  }
};

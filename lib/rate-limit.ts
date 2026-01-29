import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
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

export const globalRatelimit = hasUpstashEnv
  ? new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(120, '1 m'),
      analytics: true,
      prefix: 'sknc:middleware'
    })
  : { limit: fallbackLimit };

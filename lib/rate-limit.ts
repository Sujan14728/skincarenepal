import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis client over HTTP works in middleware/edge runtime.
const redis = Redis.fromEnv();

export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1 m'),
  analytics: true,
  prefix: 'sknc:middleware'
});

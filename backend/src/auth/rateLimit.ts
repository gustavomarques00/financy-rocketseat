export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type Bucket = {
  count: number
  resetAt: number
}

/**
 * In-memory fixed-window rate limiter.
 * Limitation: per-process only — not shared across multiple Node instances.
 */
export class MemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now()
    const existing = this.buckets.get(key)

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
      return { allowed: true, retryAfterSeconds: 0 }
    }

    if (existing.count >= this.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      }
    }

    existing.count += 1
    return { allowed: true, retryAfterSeconds: 0 }
  }

  reset(): void {
    this.buckets.clear()
  }
}

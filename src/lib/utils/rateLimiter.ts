/**
 * Rate limiter for controlling request frequency
 */

interface RateLimiterOptions {
  maxRequests: number;  // Maximum number of requests allowed
  timeWindow: number;   // Time window in milliseconds
  retryAfter: number;   // Time to wait after rate limit exceeded (ms)
}

interface ResourceState {
  tokens: number;
  lastRefill: number;
  inProgress: number;
}

/**
 * Token bucket rate limiter
 * Controls the rate of operations to prevent API abuse
 */
export class RateLimiter {
  private maxRequests: number;
  private timeWindow: number;
  private retryAfter: number;
  private resources: Map<string, ResourceState> = new Map();

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.timeWindow = options.timeWindow;
    this.retryAfter = options.retryAfter;
  }

  /**
   * Get or initialize resource state
   */
  private getResourceState(resource: string): ResourceState {
    if (!this.resources.has(resource)) {
      this.resources.set(resource, {
        tokens: this.maxRequests,
        lastRefill: Date.now(),
        inProgress: 0
      });
    }
    return this.resources.get(resource)!;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(state: ResourceState): void {
    const now = Date.now();
    const elapsed = now - state.lastRefill;

    if (elapsed > 0) {
      const tokensToAdd = (elapsed / this.timeWindow) * this.maxRequests;
      state.tokens = Math.min(this.maxRequests, state.tokens + tokensToAdd);
      state.lastRefill = now;
    }
  }

  /**
   * Attempt to acquire a token for the resource
   *
   * @param resource - The resource identifier
   * @returns true if allowed, false if rate limit exceeded
   */
  public async acquire(resource: string): Promise<boolean> {
    const state = this.getResourceState(resource);
    this.refill(state);

    // Check if we have available tokens
    if (state.tokens >= 1) {
      state.tokens -= 1;
      state.inProgress += 1;
      return true;
    }

    // Rate limit exceeded
    console.warn(`Rate limit exceeded for ${resource}`);
    return false;
  }

  /**
   * Release a token back to the pool
   *
   * @param resource - The resource identifier
   */
  public release(resource: string): void {
    const state = this.getResourceState(resource);

    if (state.inProgress > 0) {
      state.inProgress -= 1;
    }

    // Refill tokens when releasing
    this.refill(state);
  }

  /**
   * Get the current state for a resource (for debugging)
   */
  public getState(resource: string): { tokens: number; inProgress: number } {
    const state = this.getResourceState(resource);
    this.refill(state);
    return {
      tokens: state.tokens,
      inProgress: state.inProgress
    };
  }

  /**
   * Reset all rate limits
   */
  public reset(): void {
    this.resources.clear();
  }
}

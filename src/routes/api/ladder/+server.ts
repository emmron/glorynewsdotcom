import type { RequestEvent } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';
import axios from 'axios';
import { LEAGUE_API_ENDPOINT, CACHE_DURATIONS, API_RATE_LIMIT, RETRY_STRATEGY } from '$lib/config';

// Enhanced cache implementation with TTL and automatic pruning
interface CacheEntry {
    data: LeagueLadder;
    timestamp: number;
    expiresAt: number;
}

class LadderCache {
    private cache: CacheEntry | null = null;
    private readonly cacheDuration: number;
    private readonly staleWhileRevalidate: number;
    private fetchPromise: Promise<LeagueLadder> | null = null;

    constructor(cacheDuration: number, staleWhileRevalidate: number) {
        this.cacheDuration = cacheDuration;
        this.staleWhileRevalidate = staleWhileRevalidate;
    }

    async getData(): Promise<{ data: LeagueLadder; isFresh: boolean }> {
        const now = Date.now();

        // Case 1: Fresh cache available
        if (this.cache && now < this.cache.expiresAt) {
            return { data: this.cache.data, isFresh: true };
        }

        // Case 2: Stale cache available but still usable
        const staleButUsable = this.cache &&
            now < (this.cache.expiresAt + this.staleWhileRevalidate);

        // Start background refresh if not already in progress
        if (!this.fetchPromise) {
            this.fetchPromise = this.fetchFreshData().finally(() => {
                this.fetchPromise = null;
            });
        }

        // Return stale data while refresh happens in background
        if (staleButUsable) {
            return { data: this.cache.data, isFresh: false };
        }

        // Case 3: No usable cache, wait for fresh data
        const freshData = await this.fetchPromise;
        return { data: freshData, isFresh: true };
    }

    private async fetchFreshData(): Promise<LeagueLadder> {
        try {
            const data = await fetchWithRetry(`${LEAGUE_API_ENDPOINT}/ladder`);
            const now = Date.now();

            this.cache = {
                data,
                timestamp: now,
                expiresAt: now + this.cacheDuration
            };

            return data;
        } catch (error) {
            // If fetch fails but we have stale data, keep using it
            if (this.cache) {
                // Extend stale data lifetime
                this.cache.expiresAt = Date.now() + (this.staleWhileRevalidate / 2);
                return this.cache.data;
            }
            throw error;
        }
    }

    getLastModified(): string | null {
        return this.cache
            ? new Date(this.cache.timestamp).toUTCString()
            : null;
    }
}

// Improved rate limiter with token bucket algorithm
class RateLimiter {
    private readonly windowMs: number;
    private readonly maxRequests: number;
    private readonly ipLimits: Map<string, number[]> = new Map();

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;

        // Clean up expired entries every minute
        setInterval(() => this.pruneExpiredEntries(), 60000);
    }

    isAllowed(ip: string): boolean {
        const now = Date.now();

        // Initialize or get existing timestamps for this IP
        if (!this.ipLimits.has(ip)) {
            this.ipLimits.set(ip, []);
        }

        const timestamps = this.ipLimits.get(ip)!;

        // Filter out expired timestamps
        const validTimestamps = timestamps.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Update the stored timestamps
        this.ipLimits.set(ip, validTimestamps);

        // Check if rate limit is exceeded
        if (validTimestamps.length >= this.maxRequests) {
            return false;
        }

        // Add current timestamp and allow request
        validTimestamps.push(now);
        return true;
    }

    private pruneExpiredEntries(): void {
        const now = Date.now();

        for (const [ip, timestamps] of this.ipLimits.entries()) {
            const validTimestamps = timestamps.filter(
                timestamp => now - timestamp < this.windowMs
            );

            if (validTimestamps.length === 0) {
                this.ipLimits.delete(ip);
            } else {
                this.ipLimits.set(ip, validTimestamps);
            }
        }
    }

    getRetryAfter(): number {
        return Math.ceil(this.windowMs / 1000);
    }
}

// Robust fetch with exponential backoff and circuit breaker
async function fetchWithRetry<T>(url: string): Promise<T> {
    let retries = 0;
    const maxRetries = RETRY_STRATEGY.maxRetries;
    const initialDelay = RETRY_STRATEGY.initialDelayMs;

    while (retries <= maxRetries) {
        try {
            const response = await axios.get(url, {
                timeout: 5000, // 5 second timeout
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'PerthGloryNews/1.0'
                }
            });

            if (response.status === 200 && response.data) {
                return response.data as T;
            }

            throw new Error(`Invalid response: ${response.status}`);
        } catch (error) {
            retries++;

            // Circuit breaker pattern - fail fast on certain errors
            if (axios.isAxiosError(error) && error.response) {
                // Don't retry on 4xx client errors (except 429 rate limit)
                if (error.response.status >= 400 &&
                    error.response.status < 500 &&
                    error.response.status !== 429) {
                    throw error;
                }
            }

            if (retries > maxRetries) {
                throw error;
            }

            // Exponential backoff with jitter
            const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
            const delay = initialDelay * Math.pow(2, retries - 1) * jitter;

            console.log(`Retry ${retries}/${maxRetries} after ${Math.round(delay)}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Failed to fetch data after maximum retries');
}

// Initialize singletons
const ladderCache = new LadderCache(
    CACHE_DURATIONS.ladder,
    60 * 60 * 1000 // 1 hour stale-while-revalidate
);

const rateLimiter = new RateLimiter(
    API_RATE_LIMIT.windowMs,
    API_RATE_LIMIT.requestsPerWindow
);

export async function GET({ request, getClientAddress }: RequestEvent) {
    try {
        // Get client IP for rate limiting
        const clientIp = getClientAddress();

        // Apply rate limiting
        if (!rateLimiter.isAllowed(clientIp)) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded',
                retryAfter: rateLimiter.getRetryAfter()
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': rateLimiter.getRetryAfter().toString()
                }
            });
        }

        // Get data from cache or fetch fresh
        const { data, isFresh } = await ladderCache.getData();

        // Set appropriate cache headers
        const cacheControl = isFresh
            ? `public, max-age=${CACHE_DURATIONS.ladder / 1000}, stale-while-revalidate=${60 * 60}`
            : 'public, max-age=0, stale-while-revalidate=300';

        const lastModified = ladderCache.getLastModified();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Cache-Control': cacheControl,
            'X-Cache-Status': isFresh ? 'fresh' : 'stale'
        };

        if (lastModified) {
            headers['Last-Modified'] = lastModified;
        }

        return new Response(JSON.stringify(data), { headers });
    } catch (err) {
        console.error('Error in ladder API:', err);

        // Structured error response
        const errorResponse = {
            error: 'Failed to fetch ladder data',
            message: err instanceof Error ? err.message : 'Unknown error',
            code: 'LADDER_FETCH_ERROR',
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    }
}
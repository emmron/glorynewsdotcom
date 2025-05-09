import { CACHE_CONFIG } from '../types/news';

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * In-memory rate limiter
 */
export class InMemoryRateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefill: number;
  private waiting: Array<() => void> = [];

  constructor(maxRequestsPerWindow: number, windowMs: number) {
    this.maxTokens = maxRequestsPerWindow;
    this.tokens = maxRequestsPerWindow;
    this.refillRate = maxRequestsPerWindow / windowMs;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;

    if (elapsedMs > 0) {
      this.tokens = Math.min(
        this.maxTokens,
        this.tokens + elapsedMs * this.refillRate
      );
      this.lastRefill = now;
    }
  }

  public async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waiting.push(resolve);

      // Set a maximum wait time
      setTimeout(() => {
        const index = this.waiting.indexOf(resolve);
        if (index !== -1) {
          this.waiting.splice(index, 1);
          resolve();
        }
      }, 5000);
    });
  }

  public release(): void {
    this.refill();

    if (this.waiting.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const next = this.waiting.shift();
      if (next) next();
    }
  }
}

/**
 * Fetch with retry
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  retryDelay = 1000,
  rateLimiter?: InMemoryRateLimiter
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Apply rate limiting if provided
      if (rateLimiter) {
        await rateLimiter.acquire();
      }

      const response = await fetchWithTimeout(url, options);
      const data = await response.json();
      return data as T;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if we've hit the max retries
      if (attempt >= retries - 1) {
        break;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      if (rateLimiter) {
        rateLimiter.release();
      }
    }
  }

  throw lastError || new Error('Failed after multiple retries');
}

/**
 * Content utilities
 */
export function sanitizeContent(html: string): string {
  // Simple HTML tag removal - in a real app, use a proper sanitizer like DOMPurify
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractReadTime(text: string): number {
  const words = countWords(text);
  // Average reading speed: 200-250 words per minute
  return Math.max(1, Math.round(words / 200));
}

export function extractImagesFromHTML(html: string): string[] {
  const srcRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/g;
  const images: string[] = [];
  let match;

  while ((match = srcRegex.exec(html)) !== null) {
    if (match[1]) {
      images.push(match[1]);
    }
  }

  return images;
}

export function parseHTML(html: string): Document | null {
  try {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
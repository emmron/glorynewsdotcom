import { JSDOM } from 'jsdom';
import type { RateLimiter } from './types/news';

/**
 * Sanitizes HTML content
 */
export function sanitizeContent(html: string): string {
  // Remove scripts and iframes for security
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Replace relative URLs with absolute ones
  // More sophisticated sanitization could be added here

  return sanitized;
}

/**
 * Extracts reading time from content
 */
export function extractReadTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]+>/g, '');

  // Count words (approximate)
  const words = text.split(/\s+/).filter(Boolean).length;

  // Average reading speed: 200-250 words per minute
  const minutes = Math.ceil(words / 225);

  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Count words in text content
 */
export function countWords(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]+>/g, '');

  // Count words
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'User-Agent': 'PerthGloryNews/1.0',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Simple in-memory rate limiter
 */
export class InMemoryRateLimiter implements RateLimiter {
  private tokenBucket: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillRate: number; // tokens per millisecond

  constructor(
    maxRequestsPerInterval: number,
    intervalMs: number,
    initialTokens?: number
  ) {
    this.maxTokens = maxRequestsPerInterval;
    this.refillRate = maxRequestsPerInterval / intervalMs;
    this.tokenBucket = initialTokens ?? maxRequestsPerInterval;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokenBucket = Math.min(this.maxTokens, this.tokenBucket + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokenBucket >= 1) {
      this.tokenBucket -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = (1 - this.tokenBucket) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    this.tokenBucket = 0;
  }

  release(): void {
    // In a more sophisticated implementation, this could be used
    // to return tokens to the bucket if an operation completes early
  }
}

/**
 * Parse HTML document
 */
export function parseHTML(html: string): Document {
  const dom = new JSDOM(html);
  return dom.window.document;
}

/**
 * Extract image URLs from HTML
 */
export function extractImagesFromHTML(html: string): string[] {
  const document = parseHTML(html);
  const images = document.querySelectorAll('img');

  return Array.from(images)
    .map(img => img.getAttribute('src'))
    .filter(Boolean) as string[];
}

/**
 * Extract metadata from HTML
 */
export function extractMetadata(html: string): Record<string, string> {
  const document = parseHTML(html);
  const metaTags = document.querySelectorAll('meta');

  const metadata: Record<string, string> = {};

  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');

    if (name && content) {
      metadata[name] = content;
    }
  });

  return metadata;
}

/**
 * Generate a slug from a title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}
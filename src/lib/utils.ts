import { parse } from 'node-html-parser';

/**
 * Sanitizes HTML content by removing unwanted elements and normalizing whitespace
 */
export function sanitizeContent(html: string): string {
  try {
    const root = parse(html);

    // Remove unwanted elements
    const unwantedSelectors = [
      'script',
      'style',
      'iframe',
      '.ads',
      '.social-share',
      '.comments',
      'form',
    ];

    unwantedSelectors.forEach(selector => {
      root.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Get text content and normalize whitespace
    const text = root.textContent || '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  } catch (error) {
    console.error('Error sanitizing content:', error);
    return '';
  }
}

/**
 * Calculates estimated reading time in minutes
 */
export function extractReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Fetches a URL with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extracts image URLs from HTML content
 */
export function extractImages(html: string): string[] {
  try {
    const root = parse(html);
    const images = root.querySelectorAll('img');
    return images
      .map(img => img.getAttribute('src'))
      .filter((src): src is string => typeof src === 'string');
  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
}

/**
 * Creates image variants using Cloudflare Images
 */
export function createImageVariants(url: string): {
  thumbnail: string;
  medium: string;
  large: string;
  webp: string;
} {
  const baseUrl = process.env.CLOUDFLARE_IMAGES_DOMAIN;
  if (!baseUrl || !url) {
    return {
      thumbnail: url,
      medium: url,
      large: url,
      webp: url,
    };
  }

  return {
    thumbnail: `${baseUrl}/cdn-cgi/image/fit=cover,width=150,height=150/${url}`,
    medium: `${baseUrl}/cdn-cgi/image/fit=cover,width=800,height=600/${url}`,
    large: `${baseUrl}/cdn-cgi/image/fit=cover,width=1200,height=900/${url}`,
    webp: `${baseUrl}/cdn-cgi/image/format=webp/${url}`,
  };
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts metadata from content
 */
export function extractMetadata(content: string): {
  wordCount: number;
  readingTime: number;
} {
  const wordCount = content.split(/\s+/).length;
  return {
    wordCount,
    readingTime: extractReadTime(content),
  };
}
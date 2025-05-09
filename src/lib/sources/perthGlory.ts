import type { Article, NewsSource } from '../types/news';
import {
  fetchWithRetry,
  sanitizeContent,
  extractReadTime,
  countWords,
  extractImagesFromHTML,
  InMemoryRateLimiter,
  slugify
} from '../utils/fetch';

interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      url: string;
      description: string;
      link: string;
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          thumbnail?: { source_url: string };
        }
      }
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

export class PerthGlorySource implements NewsSource {
  private readonly baseUrl = 'https://www.perthglory.com.au';
  private readonly apiUrl = 'https://www.perthglory.com.au/wp-json/wp/v2/posts';
  private readonly rateLimiter = new InMemoryRateLimiter(2, 10000); // 2 requests per 10 seconds

  async fetch(): Promise<Article[]> {
    try {
      // Fetch posts with embedded data using the retry pattern
      const posts = await fetchWithRetry<WordPressPost[]>(
        `${this.apiUrl}?_embed&per_page=30`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GloryNews/1.0'
          }
        },
        3, // 3 retries
        1000, // 1 second delay base
        this.rateLimiter // Use our rate limiter
      );

      // Transform WordPress posts to our Article format
      return posts.map(post => this.transformPost(post));
    } catch (error) {
      console.error('Error fetching from Perth Glory:', error);
      return [];
    }
  }

  private transformPost(post: WordPressPost): Article {
    // Extract categories and tags
    const categories = post._embedded?.['wp:term']?.[0]?.map(term => term.name) || [];
    const tags = post._embedded?.['wp:term']?.[1]?.map(term => term.name) || [];

    // Extract author name
    const author = post._embedded?.author?.[0]?.name || 'Perth Glory FC';

    // Extract images
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const thumbnails = {
      small: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.thumbnail?.source_url,
      medium: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url,
      large: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url
    };

    // Extract additional images from content
    const contentImages = extractImagesFromHTML(post.content.rendered)
      .filter(url => url !== featuredImage);

    // Count words and calculate reading time
    const sanitizedContent = sanitizeContent(post.content.rendered);
    const wordCount = countWords(sanitizedContent);
    const readingTime = extractReadTime(sanitizedContent);

    // Create unique ID
    const id = `perthglory-${post.id}`;

    return {
      id,
      title: post.title.rendered,
      content: post.content.rendered,
      publishDate: new Date(post.date),
      sourceUrl: post.link,
      author,
      images: {
        featured: featuredImage,
        gallery: contentImages,
        thumbnails
      },
      categories,
      tags,
      metadata: {
        wordCount,
        readingTime,
        isSponsored: false,
        source: 'official',
        priority: 1
      }
    };
  }
}
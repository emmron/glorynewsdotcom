import type { Article, NewsSource } from '../types/news';

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

  async fetch(): Promise<Article[]> {
    try {
      console.log(`Fetching from Perth Glory source...`);

      // Fetch posts with embedded data
      const response = await fetch(
        `${this.apiUrl}?_embed&per_page=30`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GloryNews/1.0'
          },
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const posts = await response.json() as WordPressPost[];
      console.log(`Got ${posts.length} posts from Perth Glory source`);

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
    const contentImages = this.extractImagesFromHTML(post.content.rendered)
      .filter(url => url !== featuredImage);

    // Count words and calculate reading time
    const sanitizedContent = this.sanitizeContent(post.content.rendered);
    const wordCount = this.countWords(sanitizedContent);
    const readingTime = this.calculateReadTime(wordCount);

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

  // Helper functions
  private sanitizeContent(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }

  private calculateReadTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  private extractImagesFromHTML(html: string): string[] {
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
}
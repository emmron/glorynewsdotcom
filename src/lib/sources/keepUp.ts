import type { Article, NewsSource } from '../types/news';

interface KeepUpPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
  _embedded?: {
    author?: Array<{ name: string }>;
    'wp:featuredmedia'?: Array<{
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
      name: string;
      taxonomy: string;
    }>>;
  };
}

export class KeepUpSource implements NewsSource {
  private baseUrl = 'https://keepup.com.au/wp-json/wp/v2';

  /**
   * Fetches news articles from KeepUp
   */
  public async fetch(): Promise<Article[]> {
    try {
      console.log(`Fetching from KeepUp source...`);

      const response = await fetch(
        `${this.baseUrl}/posts?per_page=20&_embed&search=perth+glory`,
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

      const posts = await response.json() as KeepUpPost[];
      console.log(`Got ${posts.length} posts from KeepUp source`);

      return this.transformPosts(posts);
    } catch (error) {
      console.error('Error fetching KeepUp news:', error);
      return [];
    }
  }

  /**
   * Transforms WordPress posts to our unified Article format
   */
  private transformPosts(posts: KeepUpPost[]): Article[] {
    return posts.map(post => {
      // Extract categories and tags
      const terms = post._embedded?.['wp:term'] || [];
      const categories = terms[0]?.map(term => term.name) || ['A-League'];
      const tags = terms[1]?.map(term => term.name) || [];

      // Get team mentioned in the title/content
      const teamName = this.detectTeam(post.title.rendered, post.content.rendered);
      if (teamName && !categories.includes(teamName)) {
        categories.push(teamName);
      }

      // Get featured image
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
      const thumbnails = {
        medium: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url || '',
        large: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url || '',
        small: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.thumbnail?.source_url || ''
      };

      // Calculate word count and reading time
      const sanitizedContent = this.sanitizeContent(post.content.rendered);
      const wordCount = this.countWords(sanitizedContent);
      const readingTime = this.calculateReadTime(wordCount);

      // Generate unique ID based on source and post ID
      const id = `keepup-${post.id}`;

      return {
        id,
        title: post.title.rendered.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
        content: post.content.rendered,
        publishDate: new Date(post.date),
        sourceUrl: post.link,
        author: post._embedded?.author?.[0]?.name || 'KeepUp',
        images: {
          featured: featuredImage,
          thumbnails
        },
        categories,
        tags,
        metadata: {
          wordCount,
          readingTime,
          isSponsored: false,
          source: 'partner',
          priority: 2
        }
      };
    });
  }

  /**
   * Try to detect which team is mentioned in the content
   */
  private detectTeam(title: string, content: string): string | null {
    const combinedText = `${title} ${content}`.toLowerCase();

    const teams = [
      { name: 'Perth Glory', keywords: ['perth', 'glory', 'perth glory'] },
      { name: 'Melbourne City', keywords: ['melbourne city', 'city fc'] },
      { name: 'Melbourne Victory', keywords: ['melbourne victory', 'victory'] },
      { name: 'Sydney FC', keywords: ['sydney fc', 'sydney f.c'] },
      { name: 'Western Sydney Wanderers', keywords: ['western sydney', 'wanderers'] },
      { name: 'Brisbane Roar', keywords: ['brisbane', 'roar'] },
      { name: 'Adelaide United', keywords: ['adelaide', 'adelaide united'] },
      { name: 'Central Coast Mariners', keywords: ['central coast', 'mariners'] },
      { name: 'Wellington Phoenix', keywords: ['wellington', 'phoenix'] },
      { name: 'Macarthur FC', keywords: ['macarthur'] },
      { name: 'Western United', keywords: ['western united'] }
    ];

    // Find team with most mentions
    let bestMatch = null;
    let maxMatches = 0;

    for (const team of teams) {
      let matches = 0;

      for (const keyword of team.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const count = (combinedText.match(regex) || []).length;
        matches += count;
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = team.name;
      }
    }

    return maxMatches > 0 ? bestMatch : null;
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
}
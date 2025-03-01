import crypto from 'crypto';
import type { Article, NewsSource } from '../types/news';
import { CACHE_CONFIG } from '../types/news';

export class KeepUpSource implements NewsSource {
  private baseUrl = 'https://keepup.com.au/wp-json/wp/v2';

  /**
   * Fetches news articles from KeepUp
   */
  public async fetch(): Promise<Article[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts?per_page=20&_embed`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GloryNews/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const posts = await response.json();
      return this.transformPosts(posts);
    } catch (error) {
      console.error('Error fetching KeepUp news:', error);
      return [];
    }
  }

  /**
   * Transforms WordPress posts to our unified Article format
   */
  private transformPosts(posts: any[]): Article[] {
    return posts.map(post => {
      // Extract categories
      const categories = post._embedded?.['wp:term']?.[0]?.map((term: any) => term.name) || ['A-League'];

      // Get team mentioned in the title/content if any
      const teamName = this.detectTeam(post.title.rendered, post.content.rendered);
      if (teamName && !categories.includes(teamName)) {
        categories.push(teamName);
      }

      // Get featured image
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
      const featuredImageMedium = post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url || '';

      // Calculate word count and reading time
      const content = post.content.rendered.replace(/<[^>]+>/g, '');
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.floor(wordCount / 200)); // Average 200 words per minute

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
          thumbnails: {
            medium: featuredImageMedium || featuredImage
          }
        },
        categories,
        tags: post._embedded?.['wp:term']?.[1]?.map((term: any) => term.name) || [],
        metadata: {
          wordCount,
          readingTime,
          isSponsored: false,
          source: 'partner',
          priority: 2,
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
}
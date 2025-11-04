import type { Article } from '../types/news';

/**
 * Fallback articles to display when news sources are unavailable
 * These ensure users always see some content even if external APIs fail
 */
export const fallbackArticles: Article[] = [
  {
    id: 'fallback-1',
    title: 'Perth Glory Season Overview',
    content: `Perth Glory FC is an Australian professional soccer club based in Perth, Western Australia.
    The club competes in the A-League, Australia's premier soccer competition. Known for their passionate fanbase
    and rich history, Perth Glory continues to be a major force in Australian football. Stay tuned for the latest
    match updates, player news, and team developments. Our news service is currently experiencing technical
    difficulties, but we'll be back with live updates soon. In the meantime, check back regularly for the
    latest Perth Glory news and updates from the A-League season.`,
    publishDate: new Date('2024-01-15T10:00:00Z'),
    sourceUrl: 'https://www.perthglory.com.au',
    author: 'Perth Glory News Team',
    images: {
      featured: 'https://via.placeholder.com/800x600?text=Perth+Glory+FC',
      thumbnails: {
        small: 'https://via.placeholder.com/200x150?text=Perth+Glory',
        medium: 'https://via.placeholder.com/400x300?text=Perth+Glory',
        large: 'https://via.placeholder.com/800x600?text=Perth+Glory'
      }
    },
    categories: ['Team News', 'A-League'],
    tags: ['Perth Glory', 'A-League', 'Season Preview'],
    metadata: {
      wordCount: 120,
      readingTime: 1,
      isSponsored: false,
      source: 'official',
      priority: 1,
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0
      }
    },
    related: {
      articles: [],
      tags: ['Team News', 'A-League', 'Perth Glory']
    }
  },
  {
    id: 'fallback-2',
    title: 'Latest Match Updates',
    content: `Stay connected with Perth Glory for all the latest match updates, player interviews, and behind-the-scenes
    content. Our team is working to restore full news coverage. Perth Glory has a proud history in the A-League,
    with passionate supporters and talented players. Follow us for match previews, post-match analysis, and
    exclusive player content. We're experiencing temporary technical issues with our news feed, but will resume
    normal service shortly. Check our official channels for real-time match updates and team news.`,
    publishDate: new Date('2024-01-10T14:30:00Z'),
    sourceUrl: 'https://www.perthglory.com.au/news',
    author: 'Perth Glory Media Team',
    images: {
      featured: 'https://via.placeholder.com/800x600?text=Match+Updates',
      thumbnails: {
        small: 'https://via.placeholder.com/200x150?text=Match+Updates',
        medium: 'https://via.placeholder.com/400x300?text=Match+Updates',
        large: 'https://via.placeholder.com/800x600?text=Match+Updates'
      }
    },
    categories: ['Match Updates', 'News'],
    tags: ['Match Day', 'Perth Glory', 'Updates'],
    metadata: {
      wordCount: 110,
      readingTime: 1,
      isSponsored: false,
      source: 'official',
      priority: 2,
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0
      }
    },
    related: {
      articles: ['fallback-1'],
      tags: ['Match Updates', 'Team News']
    }
  },
  {
    id: 'fallback-3',
    title: 'A-League Season Highlights',
    content: `The A-League continues to deliver exciting football action across Australia. Perth Glory remains
    committed to excellence on and off the pitch. Our news aggregation service is temporarily unavailable,
    but we're working hard to bring you comprehensive coverage of all things Perth Glory. From transfer news
    to match reports, training updates to player profiles - we'll have it all covered once our service is
    restored. Thank you for your patience as we work to bring you the best Perth Glory news experience.`,
    publishDate: new Date('2024-01-05T09:00:00Z'),
    sourceUrl: 'https://www.perthglory.com.au/news',
    author: 'A-League News Desk',
    images: {
      featured: 'https://via.placeholder.com/800x600?text=A-League+Highlights',
      thumbnails: {
        small: 'https://via.placeholder.com/200x150?text=A-League',
        medium: 'https://via.placeholder.com/400x300?text=A-League',
        large: 'https://via.placeholder.com/800x600?text=A-League'
      }
    },
    categories: ['A-League', 'Highlights'],
    tags: ['A-League', 'Season', 'Football'],
    metadata: {
      wordCount: 105,
      readingTime: 1,
      isSponsored: false,
      source: 'partner',
      priority: 3,
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0
      }
    },
    related: {
      articles: ['fallback-1', 'fallback-2'],
      tags: ['A-League', 'Perth Glory']
    }
  }
];

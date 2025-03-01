export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  imageUrl: string;
}

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  _embedded?: {
    'wp:term'?: Array<Array<{ name: string }>>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

/**
 * Team statistics in the league ladder
 */
export interface TeamStats {
  id: string;
  name: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // 'W', 'L', 'D' for last 5 matches
  previousPosition?: number;
  logo?: string;
  isPerthGlory?: boolean;
}

/**
 * League ladder containing team standings
 */
export interface LeagueLadder {
  teams: TeamStats[];
  lastUpdated: string;
  leagueName: string;
  season: string;
  source?: {
    name: string;
    url: string;
    author: string;
  };
}

/**
 * Match information
 */
export interface Match {
  id: string;
  date: string;
  competition: string;
  venue: string;
  isCompleted: boolean;
  homeTeam: {
    name: string;
    logo?: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo?: string;
    score: number;
  };
}

/**
 * Collection of matches
 */
export interface Matches {
  matches: Match[];
  lastUpdated: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

/**
 * Logger interface for error tracking
 */
export interface ErrorLog {
  timestamp: Date;
  source: string;
  errorType: 'network' | 'parsing' | 'validation';
  message: string;
  stackTrace?: string;
  context: {
    url?: string;
    responseCode?: number;
    payload?: unknown;
  };
}

/**
 * Article structure for news content
 */
export interface Article {
  id: string;
  title: string;
  content: string;
  publishDate: Date;
  sourceUrl: string;
  author?: string;
  images: {
    featured?: string;
    gallery?: string[];
  };
  categories: string[];
  tags: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
    isSponsored: boolean;
  };
}

export interface NewsArticle {
  // Basic Information
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishDate: Date;
  lastModified: Date;

  // Categories and Tags
  categories?: string[];
  tags?: string[];

  // Media
  featuredImage?: string;
  imageBlurHash?: string;
  imageAlt?: string;
  gallery?: string[];

  // Metadata
  status: 'draft' | 'published';
  readTime?: number;
  viewCount: number;
  likes: number;
  shares: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;

  // Social Sharing
  twitterCard?: string;
  facebookImage?: string;

  // Source Information
  sourceUrl: string;
  sourceName: string;
  scrapedAt: Date;
  isScraped: boolean;

  // Related Content
  relatedArticles?: string[];

  // Comments
  commentsEnabled: boolean;
  commentCount: number;

  // Analytics
  pageViews: number;
  uniqueViews: number;
  averageTimeOnPage?: number;

  // Validation
  isValid: boolean;
  validationErrors?: string[];
}

export interface NewsSource {
  name: string;
  url: string;
  updateInterval: number;
  priority: 'high' | 'medium' | 'low';
  selectors: {
    list: string;
    title: string;
    content: string;
  };
}
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

export interface TeamStats {
    position: number;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string[];
    logo: string;
}

export interface LeagueLadder {
    lastUpdated: string;
    teams: TeamStats[];
}

export interface Match {
    date: string;
    competition: string;
    homeTeam: {
        name: string;
        score: number;
    };
    awayTeam: {
        name: string;
        score: number;
    };
    venue: string;
    isCompleted: boolean;
}

export interface RecentMatches {
    lastUpdated: string;
    matches: Match[];
}

export interface NewsArticle {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishDate: Date;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
  readTime?: number;
  lastModified: Date;
  imageBlurHash?: string;
  relatedArticles?: string[];
  sourceUrl: string;
  sourceName: string;
  scrapedAt: Date;
  isScraped: boolean;
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

export interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  publishDate: Date;
  source: string;
  imageUrl?: string;
}
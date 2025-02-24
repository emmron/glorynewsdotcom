export interface SourceSelectors {
  articleList: string;
  title: string;
  content: string;
  date: string;
  image: string;
}

export interface NewsSource {
  name: string;
  baseUrl: string;
  newsPath: string;
  selectors: SourceSelectors;
  updateInterval: number;
}

export interface RateLimit {
  requests: number;
  perSeconds: number;
}

export interface ScraperConfig {
  sources: {
    [key: string]: NewsSource;
  };
  rateLimit: RateLimit;
  cacheExpiry: number;
  retryAttempts: number;
} 
import { ScraperConfig } from '../types/scraper';

export const SCRAPER_CONFIG: ScraperConfig = {
  sources: {
    perthGlory: {
      name: 'Perth Glory Official',
      baseUrl: 'https://www.perthglory.com.au',
      newsPath: '/news',
      selectors: {
        articleList: '.news-list article',
        title: '.article-title',
        content: '.article-content',
        date: '.article-date',
        image: '.article-image img',
      },
      updateInterval: 15 * 60 * 1000, // 15 minutes
      priority: 'high',
    },
    keepUp: {
      name: 'Keep Up',
      baseUrl: 'https://keepup.com.au',
      newsPath: '/perth-glory',
      selectors: {
        articleList: '.news-grid article',
        title: 'h2',
        content: '.article-body',
        date: 'time',
        image: '.featured-image img',
      },
      updateInterval: 15 * 60 * 1000,
      priority: 'medium',
    },
    footballAustralia: {
      name: 'Football Australia',
      baseUrl: 'https://www.footballaustralia.com.au',
      newsPath: '/news',
      selectors: {
        articleList: '.news-item',
        title: '.news-title',
        content: '.news-content',
        date: '.news-date',
        image: '.news-image img',
      },
      updateInterval: 30 * 60 * 1000, // 30 minutes
      priority: 'medium',
    },
    aleaguesMen: {
      name: 'A-Leagues Men',
      baseUrl: 'https://aleagues.com.au',
      newsPath: '/mens/news',
      selectors: {
        articleList: '.article-card',
        title: '.article-title',
        content: '.article-body',
        date: '.article-date',
        image: '.article-image img',
      },
      updateInterval: 20 * 60 * 1000, // 20 minutes
      priority: 'medium',
    },
    theWestAustralian: {
      name: 'The West Australian',
      baseUrl: 'https://thewest.com.au',
      newsPath: '/sport/soccer/perth-glory',
      selectors: {
        articleList: '.article-item',
        title: '.article-headline',
        content: '.article-content',
        date: '.article-timestamp',
        image: '.article-image img',
      },
      updateInterval: 30 * 60 * 1000, // 30 minutes
      priority: 'medium',
    },
    socialMedia: {
      name: 'Social Media Aggregator',
      platforms: ['twitter', 'facebook', 'instagram'],
      accounts: {
        twitter: ['@PerthGloryFC', '@aleaguemen', '@ALeaguesHub'],
        facebook: ['PerthGloryFC', 'ALeaguesMen'],
        instagram: ['perthgloryfc', 'aleagues'],
      },
      updateInterval: 5 * 60 * 1000, // 5 minutes
      priority: 'low',
    },
  },
  rateLimit: {
    requests: 2,
    perSeconds: 10,
  },
  cacheExpiry: 60 * 60 * 1000, // 1 hour
  retryAttempts: 3,
}
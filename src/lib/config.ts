/**
 * API Configuration
 */

// Base API endpoints
export const LEAGUE_API_ENDPOINT = import.meta.env.VITE_LEAGUE_API_ENDPOINT || 'https://api.perthglorynews.com/api/league';
export const NEWS_API_ENDPOINT = import.meta.env.VITE_NEWS_API_ENDPOINT || 'https://api.perthglorynews.com/api/news';

// Rate limiting configuration
export const API_RATE_LIMIT = {
  requestsPerWindow: 2,
  windowMs: 10 * 1000, // 10 seconds
};

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  ladder: 15 * 60 * 1000, // 15 minutes
  matches: 15 * 60 * 1000, // 15 minutes
  news: 15 * 60 * 1000, // 15 minutes
  images: 24 * 60 * 60 * 1000, // 24 hours
};

// Retry strategy
export const RETRY_STRATEGY = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
};

// Primary data sources
export const DATA_SOURCES = {
  primary: [
    'https://www.perthglory.com.au',
    'https://keepup.com.au',
    'https://www.footballaustralia.com.au'
  ],
  social: [
    'https://twitter.com/PerthGloryFC',
    'https://facebook.com/PerthGloryFC',
    'https://instagram.com/perthgloryfc',
    'https://youtube.com/PerthGloryFC'
  ]
};
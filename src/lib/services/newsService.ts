import type { NewsItem } from '$lib/types';
import { format } from 'date-fns';

const API_URL = 'https://www.perthglory.com.au/wp-json/wp/v2/posts';
const POSTS_PER_PAGE = 30;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes as per rules
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 2;

interface WordPressPost {
    id: number;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    date: string;
    _embedded?: {
        'wp:term'?: Array<Array<{ name: string }>>;
        'wp:featuredmedia'?: Array<{
            source_url?: string;
            media_details?: {
                sizes?: {
                    medium?: {
                        source_url?: string;
                    }
                }
            }
        }>;
    };
}

interface CacheData {
    data: NewsItem[];
    timestamp: number;
    stale: boolean;
}

interface ErrorLog {
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

let cachedNews: CacheData | null = null;
let requestTimestamps: number[] = [];

const stripHtml = (html: string): string => {
    return html.replace(/<[^>]+>/g, '').trim();
};

const getImageUrl = (post: WordPressPost): string => {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    return media?.source_url ||
           media?.media_details?.sizes?.medium?.source_url ||
           '/images/default-news.jpg';
};

const formatNewsDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return format(date, 'PPpp');
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toLocaleString();
    }
};

const logError = (error: ErrorLog) => {
    console.error('News Service Error:', {
        ...error,
        timestamp: error.timestamp.toISOString()
    });
    // TODO: Send to error tracking service
};

const checkRateLimit = (): boolean => {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(timestamp =>
        now - timestamp < RATE_LIMIT_WINDOW
    );

    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    requestTimestamps.push(now);
    return true;
};

const transformWordPressPost = (post: WordPressPost): NewsItem => {
    try {
        if (!post || typeof post !== 'object') {
            throw new Error('Invalid post data');
        }

        const newsItem = {
            id: post.id.toString(),
            title: stripHtml(post.title.rendered),
            content: post.content.rendered,
            summary: stripHtml(post.excerpt.rendered),
            date: formatNewsDate(post.date),
            imageUrl: getImageUrl(post),
            category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News'
        };

        // Validate the transformed data
        if (!newsItem.title || !newsItem.content) {
            throw new Error('Missing required fields in post data');
        }

        return newsItem;
    } catch (error) {
        logError({
            timestamp: new Date(),
            source: 'transformWordPressPost',
            errorType: 'parsing',
            message: error instanceof Error ? error.message : 'Unknown error',
            stackTrace: error instanceof Error ? error.stack : undefined,
            context: { payload: post }
        });
        throw error;
    }
};

const getFallbackNews = (): NewsItem[] => {
    console.warn('Using fallback news data');
    return [{
        id: 'fallback-1',
        title: 'Unable to load news',
        content: 'Please check back later for the latest Perth Glory news.',
        summary: 'News temporarily unavailable',
        date: formatNewsDate(new Date().toISOString()),
        imageUrl: '/images/default-news.jpg',
        category: 'News'
    }];
};

async function fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = MAX_RETRIES
): Promise<T> {
    if (!checkRateLimit()) {
        throw new Error('Rate limit exceeded');
    }

    let lastError: Error | null = null;
    let lastResponse: Response | null = null;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GloryNews/1.0'
                },
                ...options
            });
            lastResponse = response;

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return await response.json() as T;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error occurred');
            logError({
                timestamp: new Date(),
                source: 'fetchWithRetry',
                errorType: 'network',
                message: lastError.message,
                stackTrace: lastError.stack,
                context: {
                    url,
                    responseCode: lastResponse?.status
                }
            });

            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
            }
        }
    }

    throw lastError || new Error('Failed to fetch after multiple retries');
}

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        // Check cache first
        if (cachedNews) {
            const now = Date.now();
            const age = now - cachedNews.timestamp;

            // Return cache if fresh
            if (age < CACHE_DURATION) {
                return cachedNews.data;
            }

            // Mark cache as stale but still use it while fetching new data
            cachedNews.stale = true;

            // If cache is stale, fetch new data in background
            if (!cachedNews.stale) {
                fetchGloryNews().catch(console.error);
                return cachedNews.data;
            }
        }

        const posts = await fetchWithRetry<WordPressPost[]>(`${API_URL}?_embed&per_page=${POSTS_PER_PAGE}`);
        const newsItems = await Promise.all(posts.map(transformWordPressPost));

        // Update cache
        cachedNews = {
            data: newsItems,
            timestamp: Date.now(),
            stale: false
        };

        return newsItems;
    } catch (error) {
        logError({
            timestamp: new Date(),
            source: 'fetchGloryNews',
            errorType: 'network',
            message: error instanceof Error ? error.message : 'Unknown error',
            stackTrace: error instanceof Error ? error.stack : undefined,
            context: {}
        });

        // Return stale cache if available
        if (cachedNews) {
            return cachedNews.data;
        }

        return getFallbackNews();
    }
}

export async function fetchNewsArticle(id: string): Promise<NewsItem | null> {
    try {
        // Check cache first
        const cachedArticle = cachedNews?.data.find(article => article.id === id);
        if (cachedArticle && Date.now() - cachedNews!.timestamp < CACHE_DURATION) {
            return cachedArticle;
        }

        const post = await fetchWithRetry<WordPressPost>(
            `${API_URL}/${id}?_embed`
        );

        return transformWordPressPost(post);
    } catch (error) {
        console.error(`Error fetching news article ${id}:`, error);

        // Fallback to cache even if expired
        const cachedArticle = cachedNews?.data.find(article => article.id === id);
        if (cachedArticle) {
            console.warn('Returning cached article');
            return cachedArticle;
        }

        return null;
    }
}
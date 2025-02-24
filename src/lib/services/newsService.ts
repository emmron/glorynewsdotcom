import type { NewsItem } from '$lib/types';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'https://www.perthglory.com.au/wp-json/wp/v2/posts';
const POSTS_PER_PAGE = 30;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
}

let cachedNews: CacheData | null = null;

const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

const getImageUrl = (post: WordPressPost): string => {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    return media?.source_url || 
           media?.media_details?.sizes?.medium?.source_url ||
           '/images/default-news.jpg';
};

const formatNewsDate = (dateString: string): string => {
    try {
        return format(new Date(dateString), 'PPpp');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

const transformWordPressPost = (post: WordPressPost): NewsItem => ({
    id: post.id.toString(),
    title: stripHtml(post.title.rendered),
    content: post.content.rendered,
    summary: stripHtml(post.excerpt.rendered),
    date: formatNewsDate(post.date),
    imageUrl: getImageUrl(post),
    category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News'
});

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
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                ...options
            });
            return response.data;
        } catch (error) {
            lastError = error as Error;
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
            }
        }
    }

    throw lastError || new Error('Failed to fetch after multiple retries');
}

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        // Check cache first
        if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_DURATION) {
            return cachedNews.data;
        }

        const posts = await fetchWithRetry<WordPressPost[]>(
            `${API_URL}?_embed&per_page=${POSTS_PER_PAGE}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GloryNews/1.0'
                }
            }
        );

        const news = posts.map(transformWordPressPost);
        
        // Update cache
        cachedNews = {
            data: news,
            timestamp: Date.now()
        };

        return news;
    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Return cached data if available, even if expired
        if (cachedNews?.data) {
            console.warn('Returning expired cached news');
            return cachedNews.data;
        }

        return getFallbackNews();
    }
}

export async function fetchNewsArticle(id: string): Promise<NewsItem | null> {
    try {
        const post = await fetchWithRetry<WordPressPost>(
            `${API_URL}/${id}?_embed`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GloryNews/1.0'
                }
            }
        );

        return transformWordPressPost(post);
    } catch (error) {
        console.error(`Error fetching news article ${id}:`, error);
        
        // Check cache for the article
        const cachedArticle = cachedNews?.data.find(article => article.id === id);
        if (cachedArticle) {
            console.warn('Returning cached article');
            return cachedArticle;
        }

        return null;
    }
}
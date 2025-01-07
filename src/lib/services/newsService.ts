import type { NewsItem } from '$lib/types';

const API_URL = 'https://www.keepup.com.au/wp-json/wp/v2/posts';
const POSTS_PER_PAGE = 30;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

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

let cachedNews: { data: NewsItem[]; timestamp: number } | null = null;

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, '').trim();

const getImageUrl = (post: WordPressPost): string => {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    return media?.source_url || 
           media?.media_details?.sizes?.medium?.source_url ||
           'https://www.perthglory.com.au/sites/per/files/styles/image_1200x/public/2023-11/231104%20PERvWUN%20MG%20%2813%20of%2082%29.jpg';
};

const formatNewsDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const transformWordPressPost = (post: WordPressPost): NewsItem => ({
    id: post.id.toString(),
    title: stripHtml(post.title.rendered),
    summary: stripHtml(post.excerpt.rendered),
    content: post.content.rendered,
    date: formatNewsDate(post.date),
    category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News',
    imageUrl: getImageUrl(post)
});

const getFallbackNews = (): NewsItem[] => [
    {
        id: "1",
        title: "Perth Glory vs Western Sydney Wanderers Match Report",
        summary: "Glory fall to Wanderers in tight contest at HBF Park.",
        content: "<p>Perth Glory suffered a 3-1 defeat to Western Sydney Wanderers at HBF Park. Despite a strong start and taking the lead, the visitors proved too strong in the second half.</p>",
        date: formatNewsDate(new Date().toISOString()),
        category: "Match Report",
        imageUrl: 'https://www.perthglory.com.au/sites/per/files/styles/image_1200x/public/2023-11/231104%20PERvWUN%20MG%20%2813%20of%2082%29.jpg'
    },
    {
        id: "2",
        title: "Next Up: Adelaide United Away",
        summary: "Glory prepare for crucial away fixture against Adelaide United.",
        content: "<p>Perth Glory head to Coopers Stadium this weekend for an important clash against Adelaide United. The team will be looking to bounce back from recent results.</p>",
        date: formatNewsDate(new Date().toISOString()),
        category: "Preview",
        imageUrl: 'https://www.perthglory.com.au/sites/per/files/styles/image_1200x/public/2023-11/231104%20PERvWUN%20MG%20%2813%20of%2082%29.jpg'
    }
];

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        // Check cache first
        if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_DURATION) {
            return cachedNews.data;
        }

        const response = await fetchWithTimeout(
            `${API_URL}?_embed&per_page=${POSTS_PER_PAGE}&search=perth+glory`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        }
        
        const posts: WordPressPost[] = await response.json();
        const transformedPosts = posts
            .filter(post => post.title?.rendered && post.content?.rendered)
            .map(transformWordPressPost);

        if (transformedPosts.length === 0) {
            return getFallbackNews();
        }

        // Update cache
        cachedNews = {
            data: transformedPosts,
            timestamp: Date.now()
        };
        
        return transformedPosts;
    } catch (error) {
        console.error('Error fetching news:', error instanceof Error ? error.message : error);
        
        // If we have stale cache, use it as fallback
        if (cachedNews?.data?.length) {
            console.log('Using stale cache as fallback');
            return cachedNews.data;
        }

        return getFallbackNews();
    }
}

export async function fetchNewsArticle(id: string): Promise<NewsItem | null> {
    try {
        // Check cache first
        if (cachedNews?.data) {
            const cachedArticle = cachedNews.data.find(article => article.id === id);
            if (cachedArticle) return cachedArticle;
        }

        // If not in cache, fetch directly
        const response = await fetchWithTimeout(
            `${API_URL}/${id}?_embed`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
        }

        const post: WordPressPost = await response.json();
        return transformWordPressPost(post);
    } catch (error) {
        console.error('Error fetching article:', error instanceof Error ? error.message : error);
        return null;
    }
}
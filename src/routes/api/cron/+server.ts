import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchGloryNews } from '$lib/services/newsService';

export async function GET({ request }: RequestEvent) {
    // Check for authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        throw error(401, 'Unauthorized');
    }

    try {
        // Fetch latest news using existing service
        const posts = await fetchGloryNews();

        // Add basic validation
        if (!Array.isArray(posts) || posts.length === 0) {
            throw new Error('Invalid or empty response from news service');
        }

        // Add rate limiting headers
        const headers = {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '59',
            'Cache-Control': 'no-store'
        };

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'News feed successfully updated',
            timestamp: new Date().toISOString(),
            postsUpdated: posts.length,
            lastPostDate: posts[0].date
        }), { headers });

    } catch (err) {
        console.error('Cron job failed:', err);
        // Fixed the error throwing to match SvelteKit's error type
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw error(500, errorMessage);
    }
}

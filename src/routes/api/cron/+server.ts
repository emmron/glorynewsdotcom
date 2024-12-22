import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ request }: RequestEvent) {
    // Check for authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        throw error(401, 'Unauthorized');
    }

    try {
        // Your cron job logic here
        // For example, fetching and caching latest news
        const response = await fetch('https://www.perthglory.com.au/wp-json/wp/v2/posts?per_page=9&_embed=true');
        const posts = await response.json();

        // You can store this data in your preferred caching solution
        // For now, we'll just return a success message
        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Cron job completed successfully',
            timestamp: new Date().toISOString(),
            postsUpdated: posts.length
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('Cron job failed:', err);
        throw error(500, 'Internal Server Error');
    }
}

import type { RecentMatches } from '$lib/types';

export async function fetchRecentMatches(): Promise<RecentMatches> {
    try {
        const response = await fetch('/data/matches.json');
        if (!response.ok) {
            throw new Error('Failed to fetch matches');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
} 
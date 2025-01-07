import type { LeagueLadder } from '$lib/types';

export async function fetchALeagueLadder(): Promise<LeagueLadder> {
    try {
        const response = await fetch('/api/ladder');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ladder: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching ladder:', error);
        throw error;
    }
} 
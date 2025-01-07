import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';

// In-memory cache
let ladderCache: LeagueLadder | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchLadderFromAPI(): Promise<LeagueLadder> {
    const response = await fetch('https://keepup.com.au/api/competitions/a-league-men/standings');
    
    if (!response.ok) {
        throw error(response.status, 'Failed to fetch ladder data');
    }
    
    const data = await response.json();
    
    return {
        lastUpdated: new Date().toISOString(),
        teams: data.standings.map((team: any) => ({
            position: team.position,
            teamName: team.team.name,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalDifference,
            points: team.points,
            form: team.form.split('').slice(-5),
            logo: team.team.logo
        }))
    };
}

export async function GET({ request }: RequestEvent) {
    try {
        const now = Date.now();
        
        // Check if we need to refresh the cache
        if (!ladderCache || now - lastFetchTime > CACHE_DURATION) {
            ladderCache = await fetchLadderFromAPI();
            lastFetchTime = now;
        }
        
        return new Response(JSON.stringify(ladderCache), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // 5 minutes browser caching
            }
        });
    } catch (err) {
        console.error('Error fetching ladder:', err);
        throw error(500, 'Failed to fetch ladder data');
    }
} 
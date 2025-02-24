import type { RequestEvent } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';

// In-memory cache
let ladderCache: LeagueLadder | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET({ request }: RequestEvent) {
    try {
        const now = Date.now();
        
        // Check if we need to refresh the cache
        if (!ladderCache || now - lastFetchTime > CACHE_DURATION) {
            // Corrected ladder data: remove duplicate entry and sort teams by points and goal difference
            let teams = [
                {
                    teamName: "Central Coast Mariners",
                    played: 10,
                    won: 7,
                    drawn: 2,
                    lost: 1,
                    goalsFor: 16,
                    goalsAgainst: 8,
                    goalDifference: 8,
                    points: 23,
                    form: ["W", "D", "L", "W", "D"],
                    logo: ""
                },
                {
                    teamName: "Melbourne City",
                    played: 11,
                    won: 6,
                    drawn: 3,
                    lost: 2,
                    goalsFor: 20,
                    goalsAgainst: 10,
                    goalDifference: 10,
                    points: 21,
                    form: ["D", "D", "D", "W", "W"],
                    logo: ""
                },
                {
                    teamName: "Adelaide United",
                    played: 10,
                    won: 6,
                    drawn: 3,
                    lost: 1,
                    goalsFor: 24,
                    goalsAgainst: 16,
                    goalDifference: 8,
                    points: 21,
                    form: ["W", "W", "D", "L", "W"],
                    logo: ""
                },
                {
                    teamName: "Melbourne Victory",
                    played: 11,
                    won: 5,
                    drawn: 4,
                    lost: 2,
                    goalsFor: 15,
                    goalsAgainst: 10,
                    goalDifference: 5,
                    points: 19,
                    form: ["W", "D", "L", "D", "D"],
                    logo: ""
                },
                {
                    teamName: "Macarthur",
                    played: 12,
                    won: 5,
                    drawn: 3,
                    lost: 4,
                    goalsFor: 24,
                    goalsAgainst: 17,
                    goalDifference: 7,
                    points: 18,
                    form: ["W", "D", "W", "W", "L"],
                    logo: ""
                },
                {
                    teamName: "Western United",
                    played: 12,
                    won: 5,
                    drawn: 3,
                    lost: 4,
                    goalsFor: 19,
                    goalsAgainst: 16,
                    goalDifference: 3,
                    points: 18,
                    form: ["W", "W", "W", "W", "L"],
                    logo: ""
                },
                {
                    teamName: "Western Sydney",
                    played: 11,
                    won: 4,
                    drawn: 3,
                    lost: 4,
                    goalsFor: 26,
                    goalsAgainst: 22,
                    goalDifference: 4,
                    points: 15,
                    form: ["D", "W", "L", "L", "D"],
                    logo: ""
                },
                {
                    teamName: "Sydney FC",
                    played: 10,
                    won: 4,
                    drawn: 2,
                    lost: 4,
                    goalsFor: 22,
                    goalsAgainst: 19,
                    goalDifference: 3,
                    points: 14,
                    form: ["L", "L", "D", "W", "D"],
                    logo: ""
                },
                {
                    teamName: "Wellington Phoenix",
                    played: 10,
                    won: 4,
                    drawn: 1,
                    lost: 5,
                    goalsFor: 12,
                    goalsAgainst: 14,
                    goalDifference: -2,
                    points: 13,
                    form: ["L", "L", "L", "W", "L"],
                    logo: ""
                },
                {
                    teamName: "Newcastle Jets",
                    played: 10,
                    won: 3,
                    drawn: 1,
                    lost: 6,
                    goalsFor: 12,
                    goalsAgainst: 15,
                    goalDifference: -3,
                    points: 10,
                    form: ["L", "W", "L", "D", "W"],
                    logo: ""
                },
                {
                    teamName: "Perth Glory",
                    played: 11,
                    won: 1,
                    drawn: 2,
                    lost: 8,
                    goalsFor: 7,
                    goalsAgainst: 30,
                    goalDifference: -23,
                    points: 5,
                    form: ["L", "L", "W", "L", "L"],
                    logo: ""
                },
                {
                    teamName: "Brisbane Roar",
                    played: 11,
                    won: 0,
                    drawn: 2,
                    lost: 9,
                    goalsFor: 12,
                    goalsAgainst: 26,
                    goalDifference: -14,
                    points: 2,
                    form: ["L", "L", "L", "L", "L"],
                    logo: ""
                }
            ];

            teams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            teams.forEach((team, index) => team.position = index + 1);

            ladderCache = {
                lastUpdated: new Date().toISOString(),
                teams
            };
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
        return new Response(JSON.stringify({ error: 'Failed to fetch ladder data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 
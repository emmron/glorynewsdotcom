import type { RecentMatches } from '$lib/types';

const FLASHSCORE_URL = 'https://www.flashscore.com.au/football/australia/a-league/';

async function fetchFlashscoreData(): Promise<RecentMatches> {
    try {
        const response = await fetch(FLASHSCORE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Flashscore data');
        }

        const html = await response.text();
        
        // We'll need to parse this server-side since client-side CORS will block it
        // For now, return static data until we set up proper server-side scraping
        return {
            lastUpdated: new Date().toISOString(),
            matches: [
                {
                    date: '2024-01-14T09:45:00.000Z',
                    competition: 'A-League Men',
                    homeTeam: {
                        name: 'Perth Glory',
                        score: 1
                    },
                    awayTeam: {
                        name: 'Western Sydney Wanderers',
                        score: 2
                    },
                    venue: 'HBF Park',
                    isCompleted: true
                },
                {
                    date: '2024-01-11T09:45:00.000Z',
                    competition: 'A-League Men',
                    homeTeam: {
                        name: 'Perth Glory',
                        score: 2
                    },
                    awayTeam: {
                        name: 'Wellington Phoenix',
                        score: 1
                    },
                    venue: 'HBF Park',
                    isCompleted: true
                },
                {
                    date: '2024-01-19T09:45:00.000Z',
                    competition: 'A-League Men',
                    homeTeam: {
                        name: 'Central Coast Mariners',
                        score: 0
                    },
                    awayTeam: {
                        name: 'Perth Glory',
                        score: 0
                    },
                    venue: 'Central Coast Stadium',
                    isCompleted: false
                }
            ]
        };
    } catch (error) {
        console.error('Error fetching Flashscore data:', error);
        throw error;
    }
}

export async function getRecentMatches(): Promise<RecentMatches> {
    return fetchFlashscoreData();
} 
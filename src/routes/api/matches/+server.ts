import type { RequestEvent } from '@sveltejs/kit';
import type { RecentMatches, Match } from '$lib/types';

type MatchOrNull = Match | null;

async function fetchWPMatches(): Promise<RecentMatches> {
    const response = await fetch('https://www.perthglory.com.au/wp-json/wp/v2/posts?per_page=10&_embed');
    if (!response.ok) {
        throw new Error('Failed to fetch matches');
    }
    
    const posts = await response.json();
    
    // Transform WordPress posts into match data
    const matches = posts.map((post: any) => {
        const content = post.content.rendered.toLowerCase();
        const title = post.title.rendered;
        
        // Only process posts that look like match reports
        if (!content.includes('match') && 
            !content.includes('defeat') && 
            !content.includes('victory')) {
            return null;
        }
        
        // Look for score patterns like "2-0" or "3-2"
        const scorePattern = /(\d+)\s*-\s*(\d+)/;
        const scoreMatch = content.match(scorePattern);
        
        // Look for team names
        let homeTeam = 'Perth Glory';
        let awayTeam = '';
        
        if (content.includes('wellington phoenix')) {
            awayTeam = 'Wellington Phoenix';
        } else if (content.includes('western united')) {
            awayTeam = 'Western United';
        } else if (content.includes('macarthur')) {
            awayTeam = 'Macarthur FC';
        }
        
        // Determine if Glory is home or away
        const isGloryAway = content.includes('at the hands of') || 
                           content.includes('away to');
        
        if (isGloryAway) {
            [homeTeam, awayTeam] = [awayTeam, homeTeam];
        }
        
        let homeScore = 0;
        let awayScore = 0;
        let isCompleted = false;
        
        if (scoreMatch) {
            homeScore = parseInt(scoreMatch[1]);
            awayScore = parseInt(scoreMatch[2]);
            if (isGloryAway) {
                [homeScore, awayScore] = [awayScore, homeScore];
            }
            isCompleted = true;
        }
        
        // Extract venue
        let venue = 'TBD';
        if (content.includes('hbf park')) {
            venue = 'HBF Park';
        } else if (content.includes('porirua')) {
            venue = 'Porirua Park';
        }
        
        return {
            date: post.date,
            competition: 'A-League Men',
            homeTeam: {
                name: homeTeam,
                score: homeScore
            },
            awayTeam: {
                name: awayTeam,
                score: awayScore
            },
            venue,
            isCompleted
        };
    })
    .filter((match: MatchOrNull): match is Match => match !== null && match.awayTeam.name !== '')
    .slice(0, 3);

    return {
        lastUpdated: new Date().toISOString(),
        matches
    };
}

export async function GET({ request }: RequestEvent) {
    try {
        const matchData = await fetchWPMatches();
        
        return new Response(JSON.stringify(matchData), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // 5 minutes browser caching
            }
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch match data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 
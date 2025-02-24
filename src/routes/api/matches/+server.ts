import type { RequestEvent } from '@sveltejs/kit';
import type { RecentMatches } from '$lib/types';

export const prerender = true;

export function GET({ request }: RequestEvent) {
    const matches: RecentMatches[] = [
        {
            date: '2024-01-17T08:45:00.000Z',
            competition: 'A-League Men',
            homeTeam: {
                name: 'Western Sydney',
                score: 0
            },
            awayTeam: {
                name: 'Central Coast',
                score: 0
            },
            venue: 'CommBank Stadium',
            isCompleted: false
        },
        {
            date: '2024-01-14T08:45:00.000Z',
            competition: 'A-League Men',
            homeTeam: {
                name: 'Perth Glory',
                score: 1
            },
            awayTeam: {
                name: 'Western Sydney',
                score: 3
            },
            venue: 'HBF Park',
            isCompleted: true
        },
        {
            date: '2024-01-08T08:45:00.000Z',
            competition: 'A-League Men',
            homeTeam: {
                name: 'Sydney FC',
                score: 2
            },
            awayTeam: {
                name: 'Perth Glory',
                score: 1
            },
            venue: 'Allianz Stadium',
            isCompleted: true
        }
    ];

    return new Response(JSON.stringify({
        lastUpdated: new Date().toISOString(),
        matches
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
        }
    });
}
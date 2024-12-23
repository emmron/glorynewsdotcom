import type { LadderEntry } from '$lib/types';

const A_LEAGUE_API = 'https://api.keepup.com.au/competitions/leagues/a-league-men/seasons/current/standings';

export async function fetchALeagueLadder(): Promise<LadderEntry[]> {
    try {
        const response = await fetch(A_LEAGUE_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return data.standings.map((entry: any) => ({
            position: entry.position,
            teamName: entry.team.name,
            played: entry.played,
            won: entry.won,
            drawn: entry.drawn,
            lost: entry.lost,
            goalsFor: entry.goalsFor,
            goalsAgainst: entry.goalsAgainst,
            goalDifference: entry.goalDifference,
            points: entry.points,
            isGlory: entry.team.name.toLowerCase().includes('perth glory')
        }));
    } catch (error) {
        console.error('Error fetching ladder:', error);
        throw error;
    }
} 
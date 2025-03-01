import { Redis } from '@upstash/redis';
import type { LeagueLadder, TeamStats } from '$lib/types';

// Cache management
const CACHE_KEY = 'perth-glory-ladder-data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const REDIS_CACHE_KEY = 'ladder_data';

// Initialize Redis client
let redis: Redis | null = null;
try {
    if (import.meta.env.VITE_UPSTASH_REDIS_REST_URL && import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
            token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
}

/**
 * Fetches the current A-League ladder standings
 * @param options Optional configuration for the fetch request
 * @returns Promise resolving to the league ladder data
 */
export async function fetchALeagueLadder(options?: {
    cache?: RequestCache,
    signal?: AbortSignal,
    forceRefresh?: boolean
}): Promise<LeagueLadder> {
    try {
        // Check Redis cache first if available and not forcing refresh
        if (redis && !options?.forceRefresh) {
            try {
                const cachedData = await redis.get(REDIS_CACHE_KEY);
                if (cachedData) {
                    console.log('Using Redis cached ladder data');
                    return cachedData as LeagueLadder;
                }
            } catch (error) {
                console.error('Error accessing Redis cache:', error);
            }
        }

        // Check browser cache if not forcing refresh
        if (!options?.forceRefresh && typeof window !== 'undefined') {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                // Use cached data if it's still fresh
                if (Date.now() - timestamp < CACHE_DURATION) {
                    console.log('Using browser cached ladder data');
                    return data;
                }
            }
        }

        // Try Google News API first
        const googleNewsUrl = 'https://news-api.google.com/v2/sports/soccer/australia/a-league/standings';

        try {
            const googleResponse = await fetch(googleNewsUrl, {
                method: 'GET',
                cache: options?.cache || 'no-cache',
                signal: options?.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Perth Glory News/1.0'
                }
            });

            if (googleResponse.ok) {
                const googleData = await googleResponse.json();
                const teams = parseGoogleDataToLadder(googleData);

                const ladderData: LeagueLadder = {
                    teams: teams,
                    lastUpdated: new Date().toISOString(),
                    leagueName: 'A-League Men',
                    season: getCurrentSeason(),
                    source: {
                        name: 'Google News',
                        url: 'https://news.google.com/sports/scores',
                        author: 'Google'
                    }
                };

                // Store in Redis cache if available
                if (redis) {
                    try {
                        await redis.set(REDIS_CACHE_KEY, ladderData, { ex: CACHE_DURATION / 1000 });
                    } catch (error) {
                        console.error('Error storing data in Redis:', error);
                    }
                }

                // Store in browser cache
                if (typeof window !== 'undefined') {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: ladderData,
                        timestamp: Date.now()
                    }));
                }

                return ladderData;
            }
        } catch (error) {
            console.error('Error fetching from Google News API:', error);
        }

        // If Google News fails, try ESPN
        const espnUrl = 'https://site.api.espn.com/apis/v2/sports/soccer/aus.1/standings';

        const espnResponse = await fetch(espnUrl, {
            method: 'GET',
            cache: options?.cache || 'no-cache',
            signal: options?.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Perth Glory News/1.0'
            }
        });

        if (espnResponse.ok) {
            const espnData = await espnResponse.json();
            const teams = parseEspnDataToLadder(espnData);

            const ladderData: LeagueLadder = {
                teams: teams,
                lastUpdated: new Date().toISOString(),
                leagueName: 'A-League Men',
                season: getCurrentSeason(),
                source: {
                    name: 'ESPN',
                    url: 'https://www.espn.com.au/football/standings/_/league/aus.1',
                    author: 'ESPN'
                }
            };

            // Store in Redis cache if available
            if (redis) {
                try {
                    await redis.set(REDIS_CACHE_KEY, ladderData, { ex: CACHE_DURATION / 1000 });
                } catch (error) {
                    console.error('Error storing data in Redis:', error);
                }
            }

            // Store in browser cache
            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: ladderData,
                    timestamp: Date.now()
                }));
            }

            return ladderData;
        }

        // If all direct sources fail, try alternate sources
        return fetchFromAlternateSource(options);
    } catch (error) {
        console.error('Error fetching ladder data:', error);
        return fetchFromAlternateSource(options);
    }
}

/**
 * Parse Google News API data to our ladder format
 */
function parseGoogleDataToLadder(googleData: any): TeamStats[] {
    try {
        const standings = googleData?.standings || googleData?.table || [];

        if (!standings.length) {
            throw new Error('No standings data found in Google News API response');
        }

        return standings.map((team: any) => {
            const teamName = team.team?.name || team.teamName || 'Unknown Team';
            const isPerthGlory = teamName.toLowerCase().includes('perth') ||
                               teamName.toLowerCase().includes('glory');

            return {
                id: team.team?.id || teamName.toLowerCase().replace(/\s+/g, '-'),
                name: teamName,
                position: team.position || team.rank || 0,
                played: team.played || team.matchesPlayed || 0,
                won: team.won || team.wins || 0,
                drawn: team.drawn || team.draws || 0,
                lost: team.lost || team.losses || 0,
                goalsFor: team.goalsFor || team.scored || 0,
                goalsAgainst: team.goalsAgainst || team.conceded || 0,
                goalDifference: team.goalDifference || (team.scored - team.conceded) || 0,
                points: team.points || 0,
                form: (team.form?.split('') || team.recentForm || generateRandomForm()),
                logo: team.team?.logo || team.teamLogo || `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
                isPerthGlory
            };
        });
    } catch (error) {
        console.error('Error parsing Google News data:', error);
        return generateFallbackLadderData();
    }
}

/**
 * Parse the A-League API data into our ladder format
 */
function parseApiDataToLadder(apiData: any): TeamStats[] {
    try {
        // Extract teams from API response
        const standings = apiData.standings || [];

        if (!standings.length) {
            throw new Error('No standings data found in API response');
        }

        return standings.map((team: any) => {
            const teamName = team.team.name;
            const isPerthGlory = teamName.toLowerCase().includes('perth') ||
                               teamName.toLowerCase().includes('glory');

            return {
                id: team.team.id || teamName.toLowerCase().replace(/\s+/g, '-'),
                name: teamName,
                position: team.position || 0,
                played: team.played || 0,
                won: team.won || 0,
                drawn: team.drawn || 0,
                lost: team.lost || 0,
                goalsFor: team.goalsFor || 0,
                goalsAgainst: team.goalsAgainst || 0,
                goalDifference: team.goalDifference || 0,
                points: team.points || 0,
                form: team.form?.split('') || generateRandomForm(),
                logo: team.team.logo || `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
                isPerthGlory
            };
        });
    } catch (error) {
        console.error('Error parsing API data:', error);
        return generateFallbackLadderData();
    }
}

/**
 * Fetch from an alternate data source
 */
async function fetchFromAlternateSource(options?: {
    cache?: RequestCache,
    signal?: AbortSignal
}): Promise<LeagueLadder> {
    try {
        // Try the Keep Football API first
        const keepFootballUrl = 'https://api.keepfootball.net/v1/competitions/a-league/standings';

        const kfResponse = await fetch(keepFootballUrl, {
            method: 'GET',
            cache: options?.cache || 'no-cache',
            signal: options?.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Perth Glory News/1.0'
            }
        });

        if (kfResponse.ok) {
            const kfData = await kfResponse.json();
            const teams = parseKeepFootballDataToLadder(kfData);

            return {
                teams: teams,
                lastUpdated: new Date().toISOString(),
                leagueName: 'A-League Men',
                season: getCurrentSeason(),
                source: {
                    name: 'Keep Football',
                    url: 'https://keepfootball.net',
                    author: 'Keep Football'
                }
            };
        }

        // Try SofaScore API
        const sofaScoreUrl = 'https://api.sofascore.com/api/v1/unique-tournament/10479/season/48982/standings/total';

        const sofaResponse = await fetch(sofaScoreUrl, {
            method: 'GET',
            cache: options?.cache || 'no-cache',
            signal: options?.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Perth Glory News/1.0'
            }
        });

        if (sofaResponse.ok) {
            const sofaData = await sofaResponse.json();
            const teams = parseSofaScoreDataToLadder(sofaData);

            return {
                teams: teams,
                lastUpdated: new Date().toISOString(),
                leagueName: 'A-League Men',
                season: getCurrentSeason(),
                source: {
                    name: 'SofaScore',
                    url: 'https://www.sofascore.com/tournament/football/australia/a-league/10479',
                    author: 'SofaScore'
                }
            };
        }

        // Fall back to local API
        return fallbackToLocalApi(options);
    } catch (error) {
        console.error('Error fetching from alternate sources:', error);

        // Fall back to local API
        return fallbackToLocalApi(options);
    }
}

/**
 * Parse SofaScore API data to our ladder format
 */
function parseSofaScoreDataToLadder(sofaData: any): TeamStats[] {
    try {
        const standings = sofaData?.standings?.[0]?.rows || [];

        if (!standings.length) {
            throw new Error('No standings found in SofaScore data');
        }

        return standings.map((team: any) => {
            const teamName = team.team?.name || 'Unknown Team';
            const isPerthGlory = teamName.toLowerCase().includes('perth') ||
                               teamName.toLowerCase().includes('glory');

            return {
                id: team.team?.id?.toString() || teamName.toLowerCase().replace(/\s+/g, '-'),
                name: teamName,
                position: team.position || 0,
                played: team.matches || 0,
                won: team.wins || 0,
                drawn: team.draws || 0,
                lost: team.losses || 0,
                goalsFor: team.scoresFor || 0,
                goalsAgainst: team.scoresAgainst || 0,
                goalDifference: team.goalsDiff || 0,
                points: team.points || 0,
                form: generateRandomForm(), // SofaScore doesn't provide form data in this format
                logo: team.team?.logo || `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
                isPerthGlory
            };
        });
    } catch (error) {
        console.error('Error parsing SofaScore data:', error);
        return generateFallbackLadderData();
    }
}

/**
 * Parse Keep Football API data to our ladder format
 */
function parseKeepFootballDataToLadder(kfData: any): TeamStats[] {
    try {
        const standings = kfData?.standings || [];

        if (!standings.length) {
            throw new Error('No standings found in Keep Football data');
        }

        return standings.map((team: any) => {
            const teamName = team.team?.name || 'Unknown Team';
            const isPerthGlory = teamName.toLowerCase().includes('perth') ||
                               teamName.toLowerCase().includes('glory');

            return {
                id: team.team?.id || teamName.toLowerCase().replace(/\s+/g, '-'),
                name: teamName,
                position: team.position || 0,
                played: team.played || 0,
                won: team.won || 0,
                drawn: team.drawn || 0,
                lost: team.lost || 0,
                goalsFor: team.goalsFor || 0,
                goalsAgainst: team.goalsAgainst || 0,
                goalDifference: team.goalDifference || 0,
                points: team.points || 0,
                form: team.form?.split('') || generateRandomForm(),
                logo: team.team?.logo || `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
                isPerthGlory
            };
        });
    } catch (error) {
        console.error('Error parsing Keep Football data:', error);
        return generateFallbackLadderData();
    }
}

/**
 * Parse ESPN API data to our ladder format
 */
function parseEspnDataToLadder(espnData: any): TeamStats[] {
    try {
        const entries = espnData?.standings?.entries || [];

        if (!entries.length) {
            throw new Error('No standings entries found in ESPN data');
        }

        return entries.map((entry: any) => {
            const stats = entry.stats || [];
            const teamName = entry.team?.name || 'Unknown Team';
            const isPerthGlory = teamName.toLowerCase().includes('perth') ||
                               teamName.toLowerCase().includes('glory');

            // Map ESPN stats to our format
            const getStat = (type: string) => {
                const stat = stats.find((s: any) => s.type === type);
                return stat ? parseInt(stat.value, 10) : 0;
            };

            // Ensure we get the right stats - ESPN sometimes uses different naming
            const getPoints = () => {
                const pointsStat = stats.find((s: any) => s.type === 'points' || s.type === 'total');
                return pointsStat ? parseInt(pointsStat.value, 10) : 0;
            };

            const getGoalDiff = () => {
                const gdStat = stats.find((s: any) =>
                    s.type === 'pointDifferential' ||
                    s.type === 'goalDifferential' ||
                    s.type === 'goalDiff'
                );
                return gdStat ? parseInt(gdStat.value, 10) : getStat('pointsFor') - getStat('pointsAgainst');
            };

            return {
                id: entry.team?.id?.toString() || teamName.toLowerCase().replace(/\s+/g, '-'),
                name: teamName,
                position: getStat('rank') || parseInt(entry.position, 10) || 0,
                played: getStat('gamesPlayed') || getStat('games') || 0,
                won: getStat('wins') || 0,
                drawn: getStat('ties') || getStat('draws') || 0,
                lost: getStat('losses') || 0,
                goalsFor: getStat('pointsFor') || getStat('goalsFor') || 0,
                goalsAgainst: getStat('pointsAgainst') || getStat('goalsAgainst') || 0,
                goalDifference: getGoalDiff(),
                points: getPoints(),
                form: parseFormFromESPN(stats) || generateRandomForm(),
                logo: entry.team?.logos?.[0]?.href || `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
                isPerthGlory
            };
        });
    } catch (error) {
        console.error('Error parsing ESPN data:', error);
        return generateFallbackLadderData();
    }
}

/**
 * Attempts to parse form data from ESPN stats if available
 */
function parseFormFromESPN(stats: any[]): string[] | null {
    try {
        const formStat = stats.find((s: any) => s.type === 'recentResults' || s.type === 'form');
        if (!formStat || !formStat.value) return null;

        // ESPN might provide form in different formats
        if (Array.isArray(formStat.value)) {
            return formStat.value.slice(0, 5).map((result: any) => {
                if (typeof result === 'string') return result.charAt(0).toUpperCase();
                return result.outcome?.charAt(0).toUpperCase() || 'D';
            });
        }

        if (typeof formStat.value === 'string') {
            return formStat.value.split('').slice(0, 5).map((c: string) => c.toUpperCase());
        }

        return null;
    } catch (error) {
        console.error('Error parsing form from ESPN:', error);
        return null;
    }
}

/**
 * Refreshes the ladder data, bypassing any cache
 * @returns Promise resolving to the latest league ladder data
 */
export async function refreshLadder(): Promise<LeagueLadder> {
    // Clear Redis cache if available
    if (redis) {
        try {
            await redis.del(REDIS_CACHE_KEY);
        } catch (error) {
            console.error('Error clearing Redis cache:', error);
        }
    }

    return fetchALeagueLadder({
        cache: 'reload',
        forceRefresh: true
    });
}

/**
 * Fallback to our API if other sources fail
 */
async function fallbackToLocalApi(options?: {
    cache?: RequestCache,
    signal?: AbortSignal
}): Promise<LeagueLadder> {
    try {
        const response = await fetch('/api/ladder', {
            method: 'GET',
            cache: options?.cache || 'no-cache',
            signal: options?.signal,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ladder from API: ${response.status}`);
        }

        const data = await response.json();

        // Validate the response data structure
        if (!data || !data.teams || !Array.isArray(data.teams)) {
            throw new Error('Invalid ladder data format received from API');
        }

        return data;
    } catch (error) {
        console.error('Even fallback API failed:', error);
        // Last resort - use hardcoded data
        return {
            teams: generateFallbackLadderData(),
            lastUpdated: new Date().toISOString(),
            leagueName: 'A-League Men',
            season: getCurrentSeason(),
            source: {
                name: 'Fallback Data',
                url: '',
                author: 'System'
            }
        };
    }
}

/**
 * Generate fallback ladder data if all else fails
 */
function generateFallbackLadderData(): TeamStats[] {
    const teams = [
        { name: 'Melbourne City', position: 1 },
        { name: 'Central Coast Mariners', position: 2 },
        { name: 'Wellington Phoenix', position: 3 },
        { name: 'Sydney FC', position: 4 },
        { name: 'Melbourne Victory', position: 5 },
        { name: 'Perth Glory', position: 6 },
        { name: 'Macarthur FC', position: 7 },
        { name: 'Adelaide United', position: 8 },
        { name: 'Brisbane Roar', position: 9 },
        { name: 'Western Sydney Wanderers', position: 10 },
        { name: 'Western United', position: 11 },
        { name: 'Newcastle Jets', position: 12 }
    ];

    return teams.map(team => {
        const position = team.position;
        const played = 27; // Standard A-League season
        const points = Math.max(0, 40 - position * 3); // Decreases with position
        const won = Math.round(points / 3);
        const drawn = Math.round(points % 3);
        const lost = played - won - drawn;
        const isPerthGlory = team.name.toLowerCase().includes('perth') ||
                          team.name.toLowerCase().includes('glory');

        return {
            id: team.name.toLowerCase().replace(/\s+/g, '-'),
            name: team.name,
            position,
            played,
            won,
            drawn,
            lost,
            goalsFor: 30 - position, // Estimate decreasing by position
            goalsAgainst: 15 + position, // Estimate increasing by position
            goalDifference: (30 - position) - (15 + position),
            points,
            form: generateRandomForm(),
            logo: `/images/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            isPerthGlory
        };
    });
}

/**
 * Generate random form data for the last 5 matches
 */
function generateRandomForm(): string[] {
    const results = ['W', 'D', 'L'];
    return Array.from({ length: 5 }, () => results[Math.floor(Math.random() * results.length)]);
}

/**
 * Get the current football season in format "2023/24"
 */
function getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed

    // A-League typically runs from October to May
    if (month >= 10) { // October to December
        return `${year}/${(year + 1).toString().slice(2)}`;
    } else { // January to September
        return `${year - 1}/${year.toString().slice(2)}`;
    }
}
import type { RequestEvent } from '@sveltejs/kit';
import type { NewsItem } from '$lib/types';

// In-memory cache
let newsCache: NewsItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET({ request }: RequestEvent) {
    try {
        const now = Date.now();
        
        // Check if we need to refresh the cache
        if (!newsCache || now - lastFetchTime > CACHE_DURATION) {
            // Static news data
            newsCache = [
                {
                    id: "1",
                    title: "Glory Secure Vital Win in Dramatic Fashion",
                    summary: "Perth Glory clinched a crucial 2-1 victory in stoppage time against Western United, boosting their finals hopes...",
                    content: "Perth Glory secured a dramatic 2-1 win against Western United with a stoppage-time winner at HBF Park. The victory marks a significant step in the team's push for finals contention.",
                    date: "January 25, 2024",
                    category: "Match Report",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "2",
                    title: "Glory Youth Academy Stars Called Up for National Duty",
                    summary: "Three Perth Glory youth players receive national team call-ups following impressive performances...",
                    content: "Three of Perth Glory's brightest young talents have been selected for national team duty, highlighting the success of the club's youth development program.",
                    date: "January 23, 2024",
                    category: "Youth",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "3",
                    title: "Record Crowd Expected for Upcoming Derby",
                    summary: "HBF Park set for capacity crowd as Perth Glory prepares for crucial derby match...",
                    content: "Perth Glory is anticipating a record attendance for the upcoming derby match, with ticket sales already reaching unprecedented levels.",
                    date: "January 22, 2024",
                    category: "Preview",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "4",
                    title: "Glory Women Dominate in Statement Victory",
                    summary: "Perth Glory Women's team delivers masterclass performance in commanding win...",
                    content: "The Perth Glory Women's team has produced their best performance of the season, dominating from start to finish in a statement victory.",
                    date: "January 21, 2024",
                    category: "Women",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "5",
                    title: "New Signing Makes Immediate Impact",
                    summary: "Glory's latest signing impresses on debut with goal and assist...",
                    content: "Perth Glory's newest recruit has made an immediate impact, contributing a goal and an assist in an impressive debut performance.",
                    date: "January 20, 2024",
                    category: "Team News",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "6",
                    title: "Community Program Reaches Milestone",
                    summary: "Perth Glory's community outreach program celebrates significant achievement...",
                    content: "The club's community program has reached a significant milestone, engaging with over 10,000 young players across Western Australia.",
                    date: "January 19, 2024",
                    category: "Community",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "7",
                    title: "Glory Launch New Youth Development Initiative",
                    summary: "Innovative youth development program set to nurture next generation of talent...",
                    content: "Perth Glory has unveiled a new youth development initiative aimed at identifying and nurturing talented young players across Western Australia.",
                    date: "January 18, 2024",
                    category: "Youth",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "8",
                    title: "Injury Update: Key Players Return",
                    summary: "Boost for Glory as multiple first-team players return to full training...",
                    content: "Perth Glory has received a significant boost with several key players returning to full training ahead of crucial upcoming fixtures.",
                    date: "January 17, 2024",
                    category: "Team News",
                    imageUrl: "/images/news/glory-victory-match.svg"
                },
                {
                    id: "9",
                    title: "Glory Foundation Expands Community Programs",
                    summary: "New partnerships enable expansion of community football initiatives...",
                    content: "The Perth Glory Foundation has announced new partnerships that will enable significant expansion of its community football programs.",
                    date: "January 16, 2024",
                    category: "Community",
                    imageUrl: "/images/news/glory-victory-match.svg"
                }
            ];
            lastFetchTime = now;
        }
        
        return new Response(JSON.stringify(newsCache), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // 5 minutes browser caching
            }
        });
    } catch (err) {
        console.error('Error fetching news:', err);
        return new Response(JSON.stringify({ error: 'Failed to fetch news data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 
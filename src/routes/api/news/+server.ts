import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Cache the news data in memory
let newsCache: any = null;
let lastFetched: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const GET: RequestHandler = async () => {
    // Return cached data if it's still fresh
    if (newsCache && Date.now() - lastFetched < CACHE_DURATION) {
        return json(newsCache);
    }

    // Static news data with real articles
    const news = [
        {
            id: "1",
            title: "Glory Secure Vital Win in Dramatic Fashion",
            summary: "Perth Glory clinched a crucial 2-1 victory in stoppage time against Western United, boosting their finals hopes with a stunning late winner from Adam Taggart.",
            content: "Perth Glory secured a dramatic 2-1 win against Western United with a stoppage-time winner at HBF Park. The victory marks a significant step in the team's push for finals contention.",
            date: "March 15, 2024",
            category: "Match Report",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/taggart-celebrates.jpg"
        },
        {
            id: "2",
            title: "Glory Youth Academy Stars Called Up for National Duty",
            summary: "Three Perth Glory youth players receive national team call-ups following impressive performances in the NPL WA competition.",
            content: "Three of Perth Glory's brightest young talents have been selected for national team duty, highlighting the success of the club's youth development program.",
            date: "March 13, 2024",
            category: "Youth",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/youth-academy.jpg"
        },
        {
            id: "3",
            title: "Record Crowd Expected for Upcoming Derby",
            summary: "HBF Park set for capacity crowd as Perth Glory prepares for crucial derby match against Western Sydney Wanderers.",
            content: "Perth Glory is anticipating a record attendance for the upcoming derby match, with ticket sales already reaching unprecedented levels.",
            date: "March 12, 2024",
            category: "Preview",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/hbf-park-crowd.jpg"
        },
        {
            id: "4",
            title: "Glory Women Dominate in Statement Victory",
            summary: "Perth Glory Women's team delivers masterclass performance in commanding win over Melbourne City.",
            content: "The Perth Glory Women's team has produced their best performance of the season, dominating from start to finish in a statement victory.",
            date: "March 10, 2024",
            category: "Women",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/glory-women.jpg"
        },
        {
            id: "5",
            title: "New Signing Makes Immediate Impact",
            summary: "Glory's latest signing impresses on debut with goal and assist in crucial victory.",
            content: "Perth Glory's newest recruit has made an immediate impact, contributing a goal and an assist in an impressive debut performance.",
            date: "March 8, 2024",
            category: "Team News",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/new-signing.jpg"
        },
        {
            id: "6",
            title: "Community Program Reaches Milestone",
            summary: "Perth Glory's community outreach program celebrates significant achievement in youth development.",
            content: "The club's community program has reached a significant milestone, engaging with over 10,000 young players across Western Australia.",
            date: "March 6, 2024",
            category: "Community",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/community-program.jpg"
        },
        {
            id: "7",
            title: "Glory Launch New Youth Development Initiative",
            summary: "Innovative youth development program set to nurture next generation of talent in Western Australia.",
            content: "Perth Glory has unveiled a new youth development initiative aimed at identifying and nurturing talented young players across Western Australia.",
            date: "March 4, 2024",
            category: "Youth",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/youth-development.jpg"
        },
        {
            id: "8",
            title: "Injury Update: Key Players Return",
            summary: "Boost for Glory as multiple first-team players return to full training ahead of crucial fixtures.",
            content: "Perth Glory has received a significant boost with several key players returning to full training ahead of crucial upcoming fixtures.",
            date: "March 2, 2024",
            category: "Team News",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/training-session.jpg"
        },
        {
            id: "9",
            title: "Glory Foundation Expands Community Programs",
            summary: "New partnerships enable expansion of community football initiatives across Western Australia.",
            content: "The Perth Glory Foundation has announced new partnerships that will enable significant expansion of its community football programs.",
            date: "March 1, 2024",
            category: "Community",
            imageUrl: "https://www.perthglory.com.au/sites/per/files/2024-03/community-football.jpg"
        }
    ];

    // Update cache
    newsCache = news;
    lastFetched = Date.now();

    return json(news);
}; 
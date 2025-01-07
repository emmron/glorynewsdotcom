export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  imageUrl: string;
}

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  _embedded?: {
    'wp:term'?: Array<Array<{ name: string }>>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

export interface TeamStats {
    position: number;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string[];
    logo: string;
}

export interface LeagueLadder {
    lastUpdated: string;
    teams: TeamStats[];
}

export interface Match {
    date: string;
    competition: string;
    homeTeam: {
        name: string;
        score: number;
    };
    awayTeam: {
        name: string;
        score: number;
    };
    venue: string;
    isCompleted: boolean;
}

export interface RecentMatches {
    lastUpdated: string;
    matches: Match[];
} 
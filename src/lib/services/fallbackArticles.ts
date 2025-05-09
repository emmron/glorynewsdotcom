import type { Article } from '../types/news';

// Define fallback articles for when API fetching fails
export const fallbackArticles: Article[] = [
  {
    id: 'fallback-1',
    title: 'Perth Glory Announces New Season Ticket Packages',
    content: '<p>Perth Glory Football Club is pleased to announce new season ticket packages for the upcoming A-League season.</p><p>The packages offer fans unprecedented access to matches and exclusive member benefits.</p>',
    publishDate: new Date('2023-07-15'),
    sourceUrl: 'https://www.perthglory.com.au/news/season-tickets',
    author: 'Perth Glory FC',
    images: {
      featured: 'https://www.perthglory.com.au/images/season-tickets.jpg',
      thumbnails: {
        small: 'https://www.perthglory.com.au/images/season-tickets-sm.jpg',
        medium: 'https://www.perthglory.com.au/images/season-tickets-md.jpg',
        large: 'https://www.perthglory.com.au/images/season-tickets-lg.jpg'
      }
    },
    categories: ['Membership', 'Tickets', 'News'],
    tags: ['season tickets', 'membership', 'a-league'],
    metadata: {
      wordCount: 250,
      readingTime: 2,
      isSponsored: false,
      source: 'official',
      priority: 1
    }
  },
  {
    id: 'fallback-2',
    title: 'Glory Signs Star Striker for New Season',
    content: '<p>Perth Glory is delighted to announce the signing of star striker Alex Johnson on a two-year deal.</p><p>Johnson joins from European club FC Barcelona and is expected to make an immediate impact.</p>',
    publishDate: new Date('2023-06-30'),
    sourceUrl: 'https://www.perthglory.com.au/news/signing-announcement',
    author: 'Perth Glory FC',
    images: {
      featured: 'https://www.perthglory.com.au/images/alex-johnson.jpg',
      thumbnails: {
        small: 'https://www.perthglory.com.au/images/alex-johnson-sm.jpg',
        medium: 'https://www.perthglory.com.au/images/alex-johnson-md.jpg',
        large: 'https://www.perthglory.com.au/images/alex-johnson-lg.jpg'
      }
    },
    categories: ['Transfer News', 'Players', 'News'],
    tags: ['transfer', 'signing', 'striker'],
    metadata: {
      wordCount: 300,
      readingTime: 2,
      isSponsored: false,
      source: 'official',
      priority: 1
    }
  },
  {
    id: 'fallback-3',
    title: 'Glory Announces Preseason Schedule',
    content: '<p>Perth Glory has unveiled its preseason schedule ahead of the upcoming A-League campaign.</p><p>The team will face several local and international opponents to prepare for the new season.</p>',
    publishDate: new Date('2023-06-15'),
    sourceUrl: 'https://www.perthglory.com.au/news/preseason-schedule',
    author: 'Perth Glory FC',
    images: {
      featured: 'https://www.perthglory.com.au/images/preseason.jpg',
      thumbnails: {
        small: 'https://www.perthglory.com.au/images/preseason-sm.jpg',
        medium: 'https://www.perthglory.com.au/images/preseason-md.jpg',
        large: 'https://www.perthglory.com.au/images/preseason-lg.jpg'
      }
    },
    categories: ['Fixtures', 'Preseason', 'News'],
    tags: ['preseason', 'fixtures', 'friendly'],
    metadata: {
      wordCount: 280,
      readingTime: 2,
      isSponsored: false,
      source: 'official',
      priority: 1
    }
  }
];
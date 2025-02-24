import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NewsScraper } from '../../../scrapers/NewsScraper';
import { SCRAPER_CONFIG } from '../../../scrapers/config';

export const GET: RequestHandler = async () => {
  try {
    const scraper = new NewsScraper();
    const articles = await scraper.scrapeAll();

    return json({
      success: true,
      articles,
      timestamp: new Date().toISOString(),
      sources: Object.keys(SCRAPER_CONFIG.sources)
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return json({
      success: false,
      error: 'Failed to scrape articles',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}; 
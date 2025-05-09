import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    title: 'About Perth Glory News',
    description: 'Your premier source for the latest Perth Glory FC news, match updates, and exclusive content'
  };
};
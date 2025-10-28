import type { PageServerLoad } from './$types';
import { creators, trendingCreatorIds } from '$lib/data/creators';
import { posts } from '$lib/data/posts';
import { categories } from '$lib/data/categories';

const buildStats = () => {
  const totalFollowers = creators.reduce((acc, creator) => acc + creator.followers, 0);
  const totalLikes = creators.reduce((acc, creator) => acc + creator.likes, 0);
  const totalViews = posts.reduce((acc, post) => acc + post.views, 0);

  return {
    totalCreators: creators.length,
    totalFollowers,
    totalLikes,
    totalPosts: posts.length,
    totalViews
  };
};

export const load: PageServerLoad = async () => {
  const trendingCreators = trendingCreatorIds
    .map((id) => creators.find((creator) => creator.id === id))
    .filter((creator): creator is (typeof creators)[number] => Boolean(creator));

  return {
    creators,
    trendingCreators,
    posts,
    categories,
    stats: buildStats()
  };
};

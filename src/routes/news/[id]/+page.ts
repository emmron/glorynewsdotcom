import type { PageLoad } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }: { params: { id: string } }) => {
  return {
    id: params.id
  };
};
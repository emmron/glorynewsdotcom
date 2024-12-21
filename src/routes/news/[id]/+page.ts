import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }: { params: { id: string } }) => {
  return {
    id: params.id
  };
}; 
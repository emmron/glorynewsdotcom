import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }: { params: { id: string } }) => {
  return {
    id: params.id
  };
};
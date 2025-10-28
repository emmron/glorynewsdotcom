export type MediaType = 'image' | 'gallery' | 'video';

export interface PostMedia {
  type: MediaType;
  sources: string[];
  aspectRatio?: string;
  poster?: string;
}

export interface Post {
  id: string;
  creatorId: string;
  title?: string;
  body: string;
  media?: PostMedia;
  likes: number;
  comments: number;
  tips: number;
  tags: string[];
  createdAt: string;
  isFree: boolean;
  views: number;
}

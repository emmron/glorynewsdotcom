export interface Creator {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  coverImage: string;
  categories: string[];
  followers: number;
  likes: number;
  posts: number;
  isFree: boolean;
  price?: number;
  bio: string;
  location: string;
  responseTime: string;
  featuredTags: string[];
  topMedia: string[];
  status: 'online' | 'recent' | 'offline';
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  postCount: number;
}

export interface ForumThread {
  id: number;
  title: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  lastPostDate: Date;
  lastPostAuthor: string;
  isPinned?: boolean;
  isLocked?: boolean;
  content?: string;
  createdAt?: Date;
}

export interface ForumReply {
  id: number;
  threadId: number;
  author: string;
  authorAvatar: string | null;
  createdAt: Date;
  content: string;
  likes: number;
  isEdited: boolean;
}

export interface ForumUser {
  username: string;
  displayName: string;
  avatar: string | null;
  joinDate: Date;
  postCount: number;
  isAdmin: boolean;
}
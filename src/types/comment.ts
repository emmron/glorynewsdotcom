export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: Date | string;
  articleId?: string;
}

export interface Reply {
  id: string;
  commentId: string;
  author: string;
  authorEmail: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  likes: number;
}

export interface CommentFormData {
  authorName: string;
  text: string;
}
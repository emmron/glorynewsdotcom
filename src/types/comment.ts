export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  text: string;
  createdAt: Date;
  // parentId?: string; // Optional: for threaded comments
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
  author: string;
  content: string;
}
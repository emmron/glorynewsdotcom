export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
  imageUrl: string;
  category: string;
  source?: string;
  sourceUrl?: string;
  author?: string;
}
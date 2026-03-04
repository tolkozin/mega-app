export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  imageAlt: string;
  featured: boolean;
  draft: boolean;
  readingTime: string;
  content: string;
  faq?: { question: string; answer: string }[];
  howTo?: {
    name: string;
    description: string;
    steps: { name: string; text: string }[];
  };
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface CategoryInfo {
  slug: string;
  name: string;
  count: number;
}

export interface TagInfo {
  slug: string;
  name: string;
  count: number;
}

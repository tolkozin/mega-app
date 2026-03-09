export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateModified?: string;
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
  /* SEO — per-article sitemap hints */
  sitemapPriority?: number;
  sitemapChangeFreq?: "daily" | "weekly" | "monthly" | "yearly";
  /* GEO — speakable excerpt for voice/AI assistants */
  speakable?: string;
  /* Distribution — ready-to-copy social snippets */
  twitterHook?: string;
  linkedinStub?: string;
  /* SEO — keyword targeting */
  keyword?: string;
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

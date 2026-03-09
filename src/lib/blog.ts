import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, TOCItem, CategoryInfo, TagInfo } from "@/types/blog";

const contentDir = path.join(process.cwd(), "content");

function parseMdxFile(fileName: string): BlogPost | null {
  const slug = fileName.replace(/\.mdx$/, "");
  const filePath = path.join(contentDir, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.draft && process.env.NODE_ENV === "production") {
    return null;
  }

  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "Mega App Team",
    category: data.category ?? "general",
    tags: data.tags ?? [],
    image: data.image ?? "/blog/default-cover.jpg",
    imageAlt: data.imageAlt ?? data.title ?? "",
    featured: data.featured ?? false,
    draft: data.draft ?? false,
    readingTime: stats.text,
    content,
    faq: data.faq,
    howTo: data.howTo,
    dateModified: data.dateModified,
    sitemapPriority: data.sitemapPriority,
    sitemapChangeFreq: data.sitemapChangeFreq,
    speakable: data.speakable,
    twitterHook: data.twitterHook,
    linkedinStub: data.linkedinStub,
    keyword: data.keyword,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) return [];

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map(parseMdxFile)
    .filter((p): p is BlogPost => p !== null);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fileName = `${slug}.mdx`;
  const filePath = path.join(contentDir, fileName);
  if (!fs.existsSync(filePath)) return null;
  return parseMdxFile(fileName);
}

export function getCategories(): CategoryInfo[] {
  const posts = getAllPosts();
  const map = new Map<string, number>();

  for (const post of posts) {
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([slug, count]) => ({
    slug,
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    count,
  }));
}

export function getTags(): TagInfo[] {
  const posts = getAllPosts();
  const map = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([slug, count]) => ({
    slug,
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    count,
  }));
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return [];

  const posts = getAllPosts().filter((p) => p.slug !== slug);

  const scored = posts.map((post) => {
    let score = 0;
    if (post.category === current.category) score += 2;
    for (const tag of post.tags) {
      if (current.tags.includes(tag)) score += 1;
    }
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function generateTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    items.push({ id, text, level });
  }

  return items;
}

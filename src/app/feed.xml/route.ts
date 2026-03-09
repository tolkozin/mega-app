import { Feed } from "feed";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export async function GET() {
  const posts = getAllPosts();

  const feed = new Feed({
    title: "Revenue Map Blog",
    description:
      "Insights on SaaS metrics, financial modeling, and e-commerce analytics.",
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    language: "en",
    image: `${SITE_URL}/logo.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Revenue Map`,
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
    author: {
      name: "Revenue Map Team",
      link: SITE_URL,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
      author: [{ name: post.author }],
      category: [{ name: post.category }],
      image: `${SITE_URL}${post.image}`,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

import type { MetadataRoute } from "next";
import { getAllPosts, getCategories, getTags } from "@/lib/blog";
import { METRICS } from "@/lib/knowledge-base";
import { PRODUCT_TYPES } from "@/lib/model-registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getCategories();
  const tags = getTags();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified ?? post.date),
    changeFrequency: (post.sitemapChangeFreq ?? "monthly") as "daily" | "weekly" | "monthly" | "yearly",
    priority: post.sitemapPriority ?? 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/blog/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const modelsIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/models`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const modelPages: MetadataRoute.Sitemap = PRODUCT_TYPES.map((key) => ({
    url: `${SITE_URL}/models/${key}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const kbIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/knowledge-base`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const kbMetrics: MetadataRoute.Sitemap = METRICS.map((m) => ({
    url: `${SITE_URL}/knowledge-base/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...modelsIndex, ...modelPages, ...kbIndex, ...kbMetrics, ...postPages, ...categoryPages, ...tagPages];
}

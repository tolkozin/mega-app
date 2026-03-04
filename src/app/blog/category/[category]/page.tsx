import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getPostsByCategory } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${name} Articles`,
    description: `Read our latest articles about ${name.toLowerCase()}.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = getPostsByCategory(category);

  if (posts.length === 0) notFound();

  const name = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight mb-3">{name}</h1>
      <p className="text-lg text-muted-foreground mb-10">
        {posts.length} article{posts.length !== 1 ? "s" : ""} in this category.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

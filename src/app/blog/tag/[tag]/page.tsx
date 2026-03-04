import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTags, getPostsByTag } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export async function generateStaticParams() {
  const tags = getTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const name = tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `Articles Tagged "${name}"`,
    description: `Browse articles tagged with ${name.toLowerCase()}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) notFound();

  const name = tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight mb-3">#{name}</h1>
      <p className="text-lg text-muted-foreground mb-10">
        {posts.length} article{posts.length !== 1 ? "s" : ""} with this tag.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Financial Modeling Insights for Founders",
  description:
    "Practical guides on SaaS metrics, startup unit economics, e-commerce profitability, and building investor-ready financial models. Written for founders who want real numbers, not theory.",
};

const POSTS_PER_PAGE = 12;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const { page, category, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const categories = getCategories();

  let posts = getAllPosts();

  if (category) {
    posts = posts.filter((p) => p.category === category);
  }

  if (q) {
    const query = q.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  const featured = posts.find((p) => p.featured);
  const nonFeatured = posts.filter((p) => p !== featured);

  const totalPages = Math.ceil(nonFeatured.length / POSTS_PER_PAGE);
  const paginatedPosts = nonFeatured.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Insights on financial modeling, SaaS metrics, and e-commerce analytics.
        </p>
      </div>

      {/* Featured hero */}
      {featured && !category && !q && currentPage === 1 && (
        <Link href={`/blog/${featured.slug}`} className="block mb-12">
          <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow md:flex">
            <div className="relative md:w-1/2 aspect-[16/9] md:aspect-auto bg-muted" />
            <div className="p-6 md:p-8 flex flex-col justify-center md:w-1/2">
              <span className="text-sm font-medium text-primary mb-2">Featured</span>
              <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
              <p className="text-muted-foreground mb-4">{featured.description}</p>
              <div className="text-sm text-muted-foreground">
                {new Date(featured.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                &middot; {featured.readingTime}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
            !category
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:border-foreground"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/blog?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
              category === cat.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:border-foreground"
            }`}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search articles..."
          className="w-full max-w-md rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      {/* Posts grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-10 text-center">
          No articles found.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
              className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
                p === currentPage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:border-foreground"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

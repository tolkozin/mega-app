import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import {
  ArticleJsonLd,
  FAQJsonLd,
  HowToJsonLd,
  BreadcrumbJsonLd,
} from "./StructuredData";
import { mdxComponents } from "./MDXComponents";
import { TableOfContents } from "./TableOfContents";
import { RelatedArticles } from "./RelatedArticles";
import { generateTOC, getRelatedPosts } from "@/lib/blog";
import type { BlogPost } from "@/types/blog";

export function ArticleLayout({ post }: { post: BlogPost }) {
  const toc = generateTOC(post.content);
  const related = getRelatedPosts(post.slug, 3);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    {
      name: post.category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      href: `/blog/category/${post.category}`,
    },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <article className="container mx-auto px-4 py-10">
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {post.faq && <FAQJsonLd faqs={post.faq} />}
      {post.howTo && <HowToJsonLd howTo={post.howTo} />}

      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 flex-wrap">
          {breadcrumbs.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {i < breadcrumbs.length - 1 ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span className="text-foreground">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link
            href={`/blog/category/${post.category}`}
            className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium hover:bg-primary/20 transition-colors"
          >
            {post.category
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </Link>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground">{post.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          By {post.author}
        </p>
      </header>

      {/* Cover image */}
      <div className="relative mb-10 aspect-[2/1] max-w-4xl overflow-hidden rounded-xl">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>

      {/* Body + TOC */}
      <div className="flex gap-10 max-w-6xl">
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="prose dark:prose-invert prose-lg max-w-none">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
                },
              }}
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 shrink-0">
          <TableOfContents items={toc} />
        </aside>
      </div>

      <RelatedArticles posts={related} />
    </article>
  );
}

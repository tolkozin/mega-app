import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export async function GET() {
  const posts = getAllPosts();

  const sections = posts.map((post) => {
    const lines = [
      `# ${post.title}`,
      "",
      `> ${post.description}`,
      "",
      `- URL: ${SITE_URL}/blog/${post.slug}`,
      `- Date: ${post.date}`,
      `- Author: ${post.author}`,
      `- Category: ${post.category}`,
      `- Tags: ${post.tags.join(", ")}`,
    ];

    if (post.keyword) {
      lines.push(`- Keyword: ${post.keyword}`);
    }

    lines.push("", post.content);

    if (post.faq && post.faq.length > 0) {
      lines.push("", "## FAQ", "");
      for (const faq of post.faq) {
        lines.push(`**Q: ${faq.question}**`);
        lines.push(`A: ${faq.answer}`, "");
      }
    }

    return lines.join("\n");
  });

  const output = [
    "# Revenue Map — Full Blog Content",
    "",
    `> Source: ${SITE_URL}`,
    "",
    "Financial modeling platform for SaaS, e-commerce, and B2B SaaS businesses.",
    "This file contains the full text of all published blog articles for AI consumption.",
    "",
    "---",
    "",
    sections.join("\n\n---\n\n"),
  ].join("\n");

  return new Response(output, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

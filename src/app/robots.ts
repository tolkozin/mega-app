import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://megaapp.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/", "/pricing"],
        disallow: ["/api/", "/auth/", "/dashboard/", "/projects/", "/onboarding/", "/shared/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog", "/blog/", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog", "/blog/", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog", "/blog/", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog", "/blog/"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/blog", "/blog/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/blog", "/blog/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

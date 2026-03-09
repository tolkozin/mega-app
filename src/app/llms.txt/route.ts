import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export async function GET() {
  const posts = getAllPosts();

  const lines = [
    "# Revenue Map",
    "",
    "> Financial modeling platform for SaaS and e-commerce businesses.",
    "",
    "Revenue Map helps founders, CFOs, and financial analysts build investor-ready financial models. The platform supports subscription (SaaS), e-commerce, and SaaS B2B business models with features including Monte Carlo simulation, scenario analysis, and automated P&L projections.",
    "",
    "## Topics Covered",
    "",
    "- SaaS financial modeling (MRR, churn, LTV, CAC)",
    "- E-commerce unit economics (AOV, COGS, repeat purchase rates)",
    "- SaaS B2B metrics (ARR, NRR, Quick Ratio, Rule of 40)",
    "- Monte Carlo simulation for financial projections",
    "- Scenario analysis (base, optimistic, pessimistic)",
    "- Investor-ready financial reports (P&L, Cash Flow, Balance Sheet)",
    "- Subscription metrics and benchmarks",
    "- Customer acquisition and retention strategies",
    "",
    "## Key Pages",
    "",
    `- Homepage: ${SITE_URL}`,
    `- Blog: ${SITE_URL}/blog`,
    `- Pricing: ${SITE_URL}/pricing`,
    "",
    "## Blog Articles",
    "",
    ...posts.map((p) => `- ${p.title}: ${SITE_URL}/blog/${p.slug}`),
    "",
    `## Detailed Content: ${SITE_URL}/llms-full.txt`,
    "",
    "## Contact",
    "",
    `- Website: ${SITE_URL}`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

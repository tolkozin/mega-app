import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/blog/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const lato = Lato({ subsets: ["latin", "latin-ext"], weight: ["400", "700", "900"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Revenue Map — Financial Modeling for SaaS & E-commerce",
    template: "%s | Revenue Map",
  },
  description:
    "Build investor-ready financial models for subscription and e-commerce businesses. Monte Carlo simulations, scenario analysis, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Revenue Map",
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
      "text/plain": `${SITE_URL}/llms.txt`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0F172A]">
      <body className={`${lato.className} bg-[#0F172A]`}>
        <OrganizationJsonLd />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

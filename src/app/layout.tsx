import type { Metadata } from "next";
import { Commissioner, Roboto } from "next/font/google";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/blog/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieBanner } from "@/components/CookieBanner";

const commissioner = Commissioner({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-commissioner",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Revenue Map — Financial Modeling for SaaS & E-commerce",
    template: "%s | Revenue Map",
  },
  description:
    "Build investor-ready financial models for subscription and e-commerce businesses. Monte Carlo simulations, scenario analysis, and more.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <body className={`${roboto.variable} ${commissioner.variable} font-sans bg-[#f8f9fc] text-[#1a1a2e]`}>
        <OrganizationJsonLd />
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

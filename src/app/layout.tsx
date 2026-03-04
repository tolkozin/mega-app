import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { OrganizationJsonLd } from "@/components/blog/StructuredData";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://megaapp.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mega App — Financial Modeling for SaaS & E-commerce",
    template: "%s | Mega App",
  },
  description:
    "Build investor-ready financial models for subscription and e-commerce businesses. Monte Carlo simulations, scenario analysis, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mega App",
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
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrganizationJsonLd />
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </body>
    </html>
  );
}

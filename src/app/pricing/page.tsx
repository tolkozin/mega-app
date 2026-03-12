import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { PricingClient } from "@/components/pricing/PricingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Pricing — Revenue Map",
  description:
    "Simple, transparent pricing. Start free and upgrade when you're ready to grow. Plans for solo founders, growing teams, and enterprises.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing — Revenue Map",
    description:
      "Simple, transparent pricing. Start free and upgrade when you're ready to grow.",
    url: `${SITE_URL}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <>
      <LandingNavbar />
      <PricingClient />
    </>
  );
}

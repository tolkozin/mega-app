import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { PricingClient } from "@/components/pricing/PricingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Pricing — Start Your 3-Day Free Trial",
  description:
    "Simple, transparent pricing with a 3-day free trial on every plan. From $23/mo for solo founders to unlimited Pro plans for growing teams. No spreadsheets, no consultants — just accurate financial models.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing — Revenue Map",
    description:
      "3-day free trial on every plan. Accurate financial models from $23/mo.",
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

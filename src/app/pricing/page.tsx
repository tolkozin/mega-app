import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { PricingClient } from "@/components/pricing/PricingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Pricing — 10-Day Free Trial, Plans from $23/mo",
  description:
    "Try Revenue Map free for 10 days. Plus plan from $23/mo for solo founders, Pro for teams. Real industry benchmarks, AI assistant, investor-ready reports — everything included. Cancel anytime.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing — Revenue Map",
    description: "10-day free trial. Plans from $23/mo. Real benchmarks, AI assistant, investor reports included.",
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

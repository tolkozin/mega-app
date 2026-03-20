import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Revenue Map team. We're here to help with any questions about our financial modeling platform.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Us — Revenue Map",
    description:
      "Get in touch with the Revenue Map team. We're here to help with any questions about our financial modeling platform.",
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center py-20">
          {/* Icon */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2163e7]/10"
          >
            <svg
              className="h-8 w-8 text-[#2163e7]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
          </div>

          <h1 className="text-4xl font-heading font-extrabold text-[#1a1a2e] mb-3">
            Contact Us
          </h1>
          <p className="text-[#6b7280] mb-10 max-w-md mx-auto leading-relaxed">
            Have a question, feedback, or need help? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>

          {/* Email card */}
          <a
            href="mailto:contact@revenuemap.app"
            className="group inline-flex flex-col items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-10 py-8 transition-all hover:border-[#2163e7]/50 hover:shadow-lg hover:shadow-[#2163e7]/10"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
              Email us at
            </span>
            <span className="text-2xl font-bold text-[#2163e7] group-hover:underline">
              contact@revenuemap.app
            </span>
            <span className="text-xs text-[#6b7280]">
              We typically respond within 24 hours
            </span>
          </a>
        </div>
      </div>
    </>
  );
}

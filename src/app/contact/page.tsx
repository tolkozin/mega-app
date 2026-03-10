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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center py-20">
          {/* Icon */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <svg
              className="h-8 w-8 text-[#3B82F6]"
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

          <h1 className="text-4xl font-black text-[#F8FAFC] mb-3">
            Contact Us
          </h1>
          <p className="text-[#94A3B8] mb-10 max-w-md mx-auto leading-relaxed">
            Have a question, feedback, or need help? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>

          {/* Email card */}
          <a
            href="mailto:contact@revenuemap.app"
            className="group inline-flex flex-col items-center gap-3 rounded-2xl border border-[#334155]/60 px-10 py-8 transition-all hover:border-[#3B82F6]/50 hover:shadow-lg hover:shadow-[#3B82F6]/10"
            style={{ background: "rgba(30,41,59,0.4)" }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Email us at
            </span>
            <span className="text-2xl font-bold text-[#3B82F6] group-hover:underline">
              contact@revenuemap.app
            </span>
            <span className="text-xs text-[#64748B]">
              We typically respond within 24 hours
            </span>
          </a>
        </div>
      </div>
    </>
  );
}

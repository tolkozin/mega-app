import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function NotFound() {
  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Big 404 */}
          <div className="relative mb-6">
            <span className="text-[120px] md:text-[160px] font-extrabold font-heading leading-none text-[#2163E7]/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2163E7]/10 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2163E7"
                  aria-hidden="true"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1a1a2e] mb-3">
            Page not found
          </h1>
          <p className="text-[#6b7280] text-sm md:text-base mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-xl hover:bg-[#1a53c7] transition-all hover:shadow-lg hover:shadow-[#2163e7]/20 cursor-pointer">
                Go to Homepage
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="h-11 px-8 border border-[#e5e7eb] text-[#1a1a2e] text-sm font-bold rounded-xl hover:border-[#2163e7]/50 hover:bg-[#2163e7]/5 transition-all cursor-pointer">
                Open Dashboard
              </button>
            </Link>
          </div>

          <p className="text-xs text-[#9ca3af] mt-10">
            Think this is an error?{" "}
            <a
              href="mailto:support@revenuemap.app"
              className="text-[#2163e7] hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

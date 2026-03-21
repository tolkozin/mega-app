"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1C1D21] mb-2">Something went wrong</h2>
        <p className="text-sm text-[#8181A5] mb-6">
          An unexpected error occurred. Your data is safe.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-10 px-6 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="h-10 px-6 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#1C1D21] hover:bg-[#f8f9fc] transition-colors inline-flex items-center"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export function LandscapeLock() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Show only on small landscape screens (height < 500px and width < 900px) */}
      <style>{`
        .landscape-lock {
          display: none;
        }
        @media (max-height: 500px) and (max-width: 900px) and (orientation: landscape) {
          .landscape-lock {
            display: flex;
          }
        }
      `}</style>
      <div className="landscape-lock fixed inset-x-0 top-0 z-[100] items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm text-white shadow-lg">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
            <path d="M8 5v3M8 10v1" />
          </svg>
          <span>For the best experience, rotate your device to portrait mode</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded px-2 py-0.5 text-xs font-medium hover:bg-white/20"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

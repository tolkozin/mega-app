"use client";

export function LandscapeLock() {
  return (
    <>
      <style>{`
        .landscape-blocker {
          display: none;
        }
        .landscape-blocker ~ .app-wrapper {
          display: contents;
        }
        @media screen and (max-width: 768px) and (orientation: landscape) {
          .landscape-blocker {
            display: flex;
          }
          .landscape-blocker ~ .app-wrapper {
            display: none;
          }
        }
      `}</style>
      <div className="landscape-blocker fixed inset-0 z-[9999] bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        {/* Rotate icon */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
        <p className="text-lg text-[#CBD5E1] font-semibold">Please rotate your device</p>
        <p className="text-sm text-[#64748B]">Revenue Map works best in portrait mode</p>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  currentPlan?: string;
}

export function UpgradePrompt({ feature, currentPlan = "Free" }: UpgradePromptProps) {
  return (
    <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.5 3.1 16l.9-5.3-4-3.9 5.5-.8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#F59E0B]">
            Upgrade to unlock more
          </p>
          <p className="text-sm text-[#8181A5] mt-1">
            {feature} is limited on the {currentPlan} plan. Upgrade to get more.
          </p>
          <Link href="/pricing" className="inline-block mt-3">
            <button className="h-8 px-4 text-xs font-bold rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors">
              View Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

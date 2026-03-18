"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  currentPlan?: string;
  limitValue?: string;
}

const planSuggestion: Record<string, { name: string; color: string }> = {
  free: { name: "Plus", color: "#5E81F4" },
  plus: { name: "Pro", color: "#8B5CF6" },
  pro: { name: "Enterprise", color: "#F59E0B" },
};

export function UpgradeModal({ open, onClose, feature, currentPlan = "free", limitValue }: UpgradeModalProps) {
  const router = useRouter();
  const suggestion = planSuggestion[currentPlan] ?? planSuggestion.free;
  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div
                className="px-6 pt-6 pb-5"
                style={{
                  background: `linear-gradient(135deg, ${suggestion.color}15, ${suggestion.color}05)`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${suggestion.color}15` }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={suggestion.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
                    </svg>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8181A5] hover:text-[#1C1D21] hover:bg-black/5 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-[#1C1D21] mt-4">
                  Upgrade to {suggestion.name}
                </h2>
                <p className="text-sm text-[#8181A5] mt-1.5 leading-relaxed">
                  You&apos;ve reached the {feature} limit on your {planLabel} plan
                  {limitValue && <> ({limitValue})</>}.
                  Upgrade to {suggestion.name} to unlock more.
                </p>
              </div>

              {/* Quick comparison */}
              <div className="px-6 py-4 border-t border-[#ECECF2]">
                <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wide mb-3">
                  What you get with {suggestion.name}
                </p>
                {currentPlan === "free" && (
                  <ul className="space-y-2">
                    <CompareRow label="Projects" current="1" next="3" />
                    <CompareRow label="Scenarios / project" current="1" next="3" />
                    <CompareRow label="Sharing" current="None" next="3 people" />
                    <CompareRow label="AI messages / month" current="10" next="30" />
                    <CompareRow label="AI reports / month" current="1" next="3" />
                  </ul>
                )}
                {currentPlan === "plus" && (
                  <ul className="space-y-2">
                    <CompareRow label="Projects" current="3" next="Unlimited" />
                    <CompareRow label="Scenarios / project" current="3" next="Unlimited" />
                    <CompareRow label="Sharing" current="3 people" next="10 people" />
                    <CompareRow label="AI messages / month" current="30" next="Unlimited" />
                    <CompareRow label="AI reports / month" current="3" next="Unlimited" />
                  </ul>
                )}
                {currentPlan === "pro" && (
                  <p className="text-sm text-[#8181A5]">
                    Contact us for custom Enterprise limits tailored to your team.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-[#ECECF2] flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/plans");
                  }}
                  className="flex-1 h-10 text-sm font-bold rounded-lg text-white transition-colors"
                  style={{ background: suggestion.color }}
                >
                  View Plans
                </button>
                <button
                  onClick={onClose}
                  className="h-10 px-5 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CompareRow({ label, current, next }: { label: string; current: string; next: string }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-[#8181A5]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[#8181A5] line-through text-xs">{current}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#14A660]">
          <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-[#14A660]">{next}</span>
      </div>
    </li>
  );
}

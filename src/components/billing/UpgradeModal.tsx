"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type ModalMode = "upgrade" | "expired" | "readonly";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  mode?: ModalMode;
  feature: string;
  currentPlan?: string;
  limitValue?: string;
}

const planSuggestion: Record<string, { name: string; color: string }> = {
  free: { name: "Plus or Pro", color: "#2163E7" },
  expired: { name: "Plus or Pro", color: "#2163E7" },
  plus: { name: "Pro", color: "#2163E7" },
  pro: { name: "Enterprise", color: "#1a1a2e" },
};

export function UpgradeModal({ open, onClose, mode = "upgrade", feature, currentPlan = "free", limitValue }: UpgradeModalProps) {
  const router = useRouter();
  const suggestion = planSuggestion[currentPlan] ?? planSuggestion.free;

  const isExpired = mode === "expired" || mode === "readonly";

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
                  background: isExpired
                    ? "linear-gradient(135deg, #F5920015, #F5920005)"
                    : `linear-gradient(135deg, ${suggestion.color}15, ${suggestion.color}05)`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: isExpired ? "#F5920015" : `${suggestion.color}15` }}
                  >
                    {isExpired ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={suggestion.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-[#1a1a2e] hover:bg-black/5 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>

                {isExpired ? (
                  <>
                    <h2 className="text-xl font-bold text-[#1a1a2e] mt-4">
                      {mode === "readonly" ? "Read-Only Mode" : "Your Subscription Has Expired"}
                    </h2>
                    <p className="text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                      {mode === "readonly"
                        ? "Your subscription is no longer active. All your data is safe, but you can\u2019t edit or create anything until you resubscribe."
                        : "Your plan has expired. All your projects, scenarios, and data are preserved — but editing and creating are disabled until you subscribe again."
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-[#1a1a2e] mt-4">
                      Upgrade to {suggestion.name}
                    </h2>
                    <p className="text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                      You&apos;ve reached the {feature} limit on your current plan
                      {limitValue && <> ({limitValue})</>}.
                      Upgrade to {suggestion.name} to unlock more.
                    </p>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-4 border-t border-[#eef0f6]">
                {isExpired ? (
                  <>
                    <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wide mb-3">
                      What&apos;s happening
                    </p>
                    <ul className="space-y-2.5">
                      <StatusRow icon="check" text="All your data is safely preserved" />
                      <StatusRow icon="check" text="You can view your dashboards and reports" />
                      <StatusRow icon="lock" text="Editing configurations is disabled" />
                      <StatusRow icon="lock" text="Creating projects or scenarios is disabled" />
                      <StatusRow icon="lock" text="AI assistant is disabled" />
                    </ul>
                    <p className="text-xs text-[#9ca3af] mt-3">
                      Resubscribe to Plus or Pro to instantly restore full access. All plans include a 10-day free trial.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wide mb-3">
                      What you get with {suggestion.name}
                    </p>
                    {currentPlan === "plus" ? (
                      <ul className="space-y-2">
                        <CompareRow label="Projects" current="3" next="Unlimited" />
                        <CompareRow label="Scenarios / project" current="3" next="Unlimited" />
                        <CompareRow label="Sharing" current="3 people" next="10 people" />
                        <CompareRow label="AI messages / month" current="30" next="Unlimited" />
                        <CompareRow label="AI reports / month" current="3" next="Unlimited" />
                      </ul>
                    ) : currentPlan === "pro" ? (
                      <p className="text-sm text-[#9ca3af]">
                        Contact us for custom Enterprise limits tailored to your team.
                      </p>
                    ) : (
                      /* expired or free (no subscription) → show Plus features */
                      <ul className="space-y-2">
                        <CompareRow label="Projects" current="Read-only" next="3 (Plus) / Unlimited (Pro)" />
                        <CompareRow label="Scenarios / project" current="None" next="3 / Unlimited" />
                        <CompareRow label="Sharing" current="None" next="3 / 10 people" />
                        <CompareRow label="AI messages / month" current="None" next="30 / Unlimited" />
                        <CompareRow label="AI reports / month" current="None" next="3 / Unlimited" />
                        <li className="text-xs text-[#9ca3af] pt-1">All plans include a 10-day free trial.</li>
                      </ul>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-[#eef0f6] flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/plans");
                  }}
                  className="flex-1 h-10 text-sm font-bold rounded-lg text-white transition-colors"
                  style={{ background: isExpired ? "#F59E0B" : suggestion.color }}
                >
                  {isExpired ? "Resubscribe Now" : "View Plans"}
                </button>
                <button
                  onClick={onClose}
                  className="h-10 px-5 text-sm font-bold rounded-lg border border-[#eef0f6] text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
                >
                  {isExpired ? "Continue Viewing" : "Maybe Later"}
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
      <span className="text-[#9ca3af]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[#9ca3af] line-through text-xs">{current}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#14A660]">
          <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-[#14A660]">{next}</span>
      </div>
    </li>
  );
}

function StatusRow({ icon, text }: { icon: "check" | "lock"; text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {icon === "check" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#14A660]">
          <path d="M4 8.5L6.5 11L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#F59E0B]">
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      <span className="text-[#1a1a2e]">{text}</span>
    </li>
  );
}

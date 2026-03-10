"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CookiePrefs {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (prefs: CookiePrefs) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));

    if (prefs.analytics) {
      // TODO: posthog.opt_in_capturing()
    } else {
      // TODO: posthog.opt_out_capturing()
    }

    setVisible(false);
  };

  const acceptAll = () =>
    handleConsent({ essential: true, functional: true, analytics: true });

  const essentialOnly = () =>
    handleConsent({ essential: true, functional: false, analytics: false });

  const savePreferences = () =>
    handleConsent({ essential: true, functional, analytics });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed z-[9999] bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[420px]"
        >
          <div
            className="rounded-t-2xl sm:rounded-2xl border border-[#334155]/80 p-4 sm:p-5"
            style={{
              background: "rgba(15, 23, 42, 0.97)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
          >
            {!expanded ? (
              /* ── Compact banner ── */
              <>
                <p className="text-[15px] font-bold text-[#F8FAFC] mb-2">
                  We use cookies
                </p>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-4">
                  We use essential cookies to run the site, and optional analytics
                  cookies to improve your experience. No advertising. No data
                  selling.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-[13px] text-[#64748B] hover:text-[#CBD5E1] hover:underline transition-colors px-1"
                  >
                    Customize
                  </button>
                  <button
                    onClick={essentialOnly}
                    className="text-[13px] text-[#CBD5E1] border border-[#334155] hover:border-[#94A3B8] rounded-lg px-4 py-2 transition-colors"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={acceptAll}
                    className="text-[13px] font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg px-4 py-2 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </>
            ) : (
              /* ── Expanded preferences ── */
              <>
                <p className="text-[15px] font-bold text-[#F8FAFC] mb-4">
                  Cookie Preferences
                </p>

                {/* Essential */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-[#F8FAFC]">
                      Essential Cookies
                    </span>
                    <Toggle checked disabled />
                  </div>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Required for the site to work.
                  </p>
                </div>

                <div className="border-t border-[#334155]/40" />

                {/* Functional */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-[#F8FAFC]">
                      Functional Cookies
                    </span>
                    <Toggle
                      checked={functional}
                      onChange={() => setFunctional(!functional)}
                    />
                  </div>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Remember your preferences and settings.
                  </p>
                </div>

                <div className="border-t border-[#334155]/40" />

                {/* Analytics */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-[#F8FAFC]">
                      Analytics Cookies
                    </span>
                    <Toggle
                      checked={analytics}
                      onChange={() => setAnalytics(!analytics)}
                    />
                  </div>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Help us understand how the site is used.
                  </p>
                </div>

                <button
                  onClick={savePreferences}
                  className="w-full mt-3 text-[13px] font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg px-4 py-2.5 transition-colors"
                >
                  Save Preferences
                </button>

                <Link
                  href="/cookies"
                  className="block mt-3 text-[12px] text-[#3B82F6] hover:underline"
                >
                  Learn more in our Cookie Policy
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Toggle switch ── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={disabled ? undefined : onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#3B82F6]" : "bg-[#334155]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        } mt-[2px]`}
      />
    </button>
  );
}

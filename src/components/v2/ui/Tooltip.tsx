"use client";

/**
 * v2 Tooltip / Info Annotation (сноска с пояснением)
 *
 * Two variants:
 *  - InfoTooltip: Small (i) icon that shows a popover on hover/tap
 *  - MetricTooltip: Wraps a metric label and adds the (i) hint
 *
 * Usage:
 *   <MetricTooltip label="LTV/CAC" hint="Lifetime Value divided by Customer Acquisition Cost. Healthy ratio is > 3.">
 *     <span>4.2x</span>
 *   </MetricTooltip>
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── InfoTooltip (standalone icon) ─── */

interface InfoTooltipProps {
  /** Tooltip text */
  hint: string;
  /** Size of the (i) icon */
  size?: number;
  /** Extra className for the wrapper */
  className?: string;
}

export function InfoTooltip({ hint, size = 14, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    // Determine if tooltip should show above or below
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAbove(rect.top > 120);
    }
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      <button
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-full border border-[#e0e3ed] bg-[#f8f9fc] text-[#9ca3af] hover:text-[#2163E7] hover:border-[#2163E7]/30 transition-colors"
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        aria-label="More info"
        type="button"
      >
        <span className="font-bold leading-none" style={{ marginTop: -0.5 }}>i</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: above ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: above ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => clearTimeout(timeoutRef.current)}
            onMouseLeave={hide}
            className={`absolute z-50 w-56 px-3 py-2.5 rounded-[10px] bg-[#1a1a2e] text-white text-[11px] leading-relaxed font-medium shadow-lg ${
              above
                ? "bottom-full mb-1.5 left-1/2 -translate-x-1/2"
                : "top-full mt-1.5 left-1/2 -translate-x-1/2"
            }`}
          >
            {hint}
            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] rotate-45 ${
                above ? "-bottom-1" : "-top-1"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ─── MetricTooltip (label + icon wrapper) ─── */

interface MetricTooltipProps {
  /** Label text shown before the icon */
  label: string;
  /** Tooltip explanation */
  hint: string;
  /** Content (metric value) rendered below */
  children: React.ReactNode;
  /** Extra className */
  className?: string;
}

export function MetricTooltip({ label, hint, children, className }: MetricTooltipProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
          {label}
        </span>
        <InfoTooltip hint={hint} size={13} />
      </div>
      {children}
    </div>
  );
}

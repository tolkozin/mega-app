"use client";

import React, { useState } from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── 1. AnimatedAccordion ─────────────────────────────────── */

interface AnimatedAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

export function AnimatedAccordion({
  title,
  children,
  defaultOpen = false,
  color,
}: AnimatedAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full text-left py-1.5 cursor-pointer"
      >
        {color && (
          <span
            className="w-[3px] self-stretch rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <ChevronRight size={14} color="#1a1a2e" />
        </span>
        <span className="text-[13px] font-[800] text-[#1a1a2e] font-[Lato,sans-serif]">
          {title}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 2. SegmentedControl ──────────────────────────────────── */

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="flex w-full rounded-full bg-[#eef0f6] p-0.5">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              selected
                ? "bg-white text-[#2163E7] shadow-sm"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── 3. ToggleSwitch ──────────────────────────────────────── */

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
          checked ? "bg-[#2163E7]" : "bg-[#d1d5db]"
        }`}
      >
        <motion.span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? 18 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span className="text-sm text-[#1a1a2e] font-[Lato,sans-serif]">
          {label}
        </span>
      )}
    </div>
  );
}

/* ─── 4. PlanMixBar ────────────────────────────────────────── */

interface PlanMixBarProps {
  weekly: number;
  monthly: number;
  annual: number;
}

export function PlanMixBar({ weekly, monthly, annual }: PlanMixBarProps) {
  const sum = weekly + monthly + annual;

  return (
    <div className="w-full">
      <div className="h-2.5 rounded-full overflow-hidden flex bg-[#eef0f6]">
        {weekly > 0 && (
          <div
            className="h-full"
            style={{ width: `${weekly}%`, backgroundColor: "#BDD0F8" }}
          />
        )}
        {monthly > 0 && (
          <div
            className="h-full"
            style={{ width: `${monthly}%`, backgroundColor: "#7BA3F0" }}
          />
        )}
        {annual > 0 && (
          <div
            className="h-full"
            style={{ width: `${annual}%`, backgroundColor: "#2163E7" }}
          />
        )}
      </div>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] text-[#6b7280] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#BDD0F8] inline-block" />
          Weekly {weekly}%
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[#6b7280] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#7BA3F0] inline-block" />
          Monthly {monthly}%
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[#6b7280] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2163E7] inline-block" />
          Annual {annual}%
        </span>
      </div>
      {sum !== 100 && (
        <p className="text-[10px] text-[#EF4444] font-medium mt-1">
          Mix should sum to 100% (currently {sum}%)
        </p>
      )}
    </div>
  );
}

/* ─── 5. PhaseTimeline ─────────────────────────────────────── */

interface PhaseTimelineProps {
  phase1Dur: number;
  phase2Dur: number;
  totalMonths: number;
  colors?: [string, string, string];
}

export function PhaseTimeline({
  phase1Dur,
  phase2Dur,
  totalMonths,
  colors = ["#2163E7", "#7BA3F0", "#BDD0F8"],
}: PhaseTimelineProps) {
  const phase3Dur = totalMonths - phase1Dur - phase2Dur;
  const phases = [
    { label: "P1", dur: phase1Dur, color: colors[0], id: 1 },
    { label: "P2", dur: phase2Dur, color: colors[1], id: 2 },
    { label: "P3", dur: phase3Dur, color: colors[2], id: 3 },
  ];

  return (
    <div className="w-full">
      <div className="h-3 rounded-full overflow-hidden flex">
        {phases.map((p) => {
          if (p.dur <= 0) return null;
          return (
            <div
              key={p.id}
              className="h-full"
              style={{ width: `${(p.dur / totalMonths) * 100}%`, backgroundColor: p.color }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        {phases.map((p) => {
          if (p.dur <= 0) return null;
          return (
            <span key={p.id} className="flex items-center gap-1 text-[10px] text-[#6b7280] font-medium">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
              {p.label}: {p.dur}mo
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 6. PhaseSummaryCard ──────────────────────────────────── */

interface PhaseSummaryCardProps {
  items: { label: string; value: string; color?: string }[];
}

export function PhaseSummaryCard({ items }: PhaseSummaryCardProps) {
  return (
    <div className="bg-[#f8f9fc] rounded-xl p-3 border border-[#eef0f6]">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[9px] uppercase tracking-wide text-[#9ca3af] font-[Lato,sans-serif]">
              {item.label}
            </p>
            <p
              className="text-[14px] font-black text-[#1a1a2e] font-[Lato,sans-serif]"
              style={item.color ? { color: item.color } : undefined}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 7. RetentionFunnel ───────────────────────────────────── */

interface RetentionFunnelStep {
  label: string;
  value: number;
  color: string;
}

interface RetentionFunnelProps {
  steps: RetentionFunnelStep[];
}

export function RetentionFunnel({ steps }: RetentionFunnelProps) {
  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        {steps.map((step, i) => {
          const widthPct = Math.max((step.value / maxVal) * 100, 12);
          return (
            <div
              key={i}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${widthPct}%`,
                backgroundColor: step.color,
                minWidth: "30px",
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {steps.map((step, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] text-[#6b7280] font-medium">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: step.color }} />
            {step.label} {step.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── 8. PhasePresets ──────────────────────────────────────── */

interface PhasePresetsProps {
  onApply: (preset: "conservative" | "moderate" | "aggressive") => void;
}

const PRESET_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

export function PhasePresets({ onApply }: PhasePresetsProps) {
  return (
    <div className="flex w-full rounded-full bg-[#eef0f6] p-0.5">
      {PRESET_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onApply(opt.value as "conservative" | "moderate" | "aggressive")}
          className="flex-1 rounded-full px-3 py-1 text-[11px] font-bold text-[#9ca3af] hover:text-[#2163E7] hover:bg-white transition-all duration-200 cursor-pointer"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── 9. InlineWarning ─────────────────────────────────────── */

interface InlineWarningProps {
  message: string;
  type?: "warning" | "error";
}

export function InlineWarning({ message, type = "warning" }: InlineWarningProps) {
  const color = type === "error" ? "#EF4444" : "#F59E0B";

  return (
    <div className="flex items-center gap-1">
      <AlertTriangle size={12} color={color} />
      <span className="text-[10px] font-medium" style={{ color }}>
        {message}
      </span>
    </div>
  );
}

/* ─── 10. InfoIcon ─────────────────────────────────────────── */

export function InfoIcon({ tooltip }: { tooltip: string }) {
  const [show, setShow] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean; alignRight: boolean }>({ top: 0, left: 0, above: true, alignRight: false });

  const handleToggle = () => {
    if (!show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const above = rect.top > 160;
      const alignRight = rect.left > window.innerWidth / 2;
      setPos({
        top: above ? rect.top - 8 : rect.bottom + 8,
        left: alignRight ? rect.right : rect.left,
        above,
        alignRight,
      });
    }
    setShow((v) => !v);
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center justify-center w-[13px] h-[13px] rounded-full border border-[#e0e3ed] bg-[#f8f9fc] text-[#9ca3af] text-[7px] font-bold cursor-help ml-1 hover:text-[#2163E7] hover:border-[#2163E7]/30 transition-colors"
      onMouseEnter={() => handleToggle()}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); handleToggle(); }}
    >
      i
      {show && (
        <span
          className="fixed z-[9999] px-3 py-2 bg-[#1a1a2e] text-white text-[10px] leading-relaxed rounded-[10px] shadow-lg w-[240px] max-w-[calc(100vw-2rem)] whitespace-normal pointer-events-none font-medium"
          style={{
            top: pos.above ? pos.top : pos.top,
            left: pos.alignRight ? 'auto' : pos.left,
            right: pos.alignRight ? (window.innerWidth - pos.left) : 'auto',
            transform: pos.above ? 'translateY(-100%)' : 'none',
          }}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}

/* ─── 11. NumberField (card style) ─────────────────────────── */

function CardNumberInput({ value, onChange, min, max, step, wide }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; wide?: boolean;
}) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value));
  const [focused, setFocused] = useState(false);

  React.useEffect(() => {
    if (!focused) setDisplay(value === 0 ? "" : String(value));
  }, [value, focused]);

  return (
    <div className={`flex items-center bg-white border-[1.5px] border-[#e8eaf0] rounded-[7px] px-2 py-1 ${wide ? "w-[100px]" : "w-full"} shrink-0`}>
      <input
        type="number"
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value);
          onChange(e.target.value === "" ? 0 : Number(e.target.value));
        }}
        onFocus={() => { setFocused(true); if (value === 0) setDisplay(""); }}
        onBlur={() => { setFocused(false); if (display === "" || display === "0") setDisplay(""); }}
        placeholder="0"
        min={min} max={max} step={step || 1}
        className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-[#1a1a2e] font-[Lato,sans-serif] tabular-nums placeholder:text-[#C4C4D4]"
      />
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-[11px] p-2.5 border-[1.5px] border-[#eef0f6] bg-[#f8f9fc]">
      <span className="flex-1 min-w-0 text-[12px] font-semibold text-[#1a1a2e] font-[Lato,sans-serif]">
        {label}{help && <InfoIcon tooltip={help} />}
      </span>
      <CardNumberInput value={value} onChange={onChange} min={min} max={max} step={step} wide />
    </div>
  );
}

/* ─── 12. TripleField (card style) ─────────────────────────── */

interface TripleFieldProps {
  label: string;
  help?: string;
  values: [number, number, number];
  perPhase: boolean;
  onChange: (phase: 1 | 2 | 3, value: number) => void;
  onChangeAll: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function TripleField({
  label, help, values, perPhase, onChange, onChangeAll,
  min, max, step,
}: TripleFieldProps) {
  if (!perPhase) {
    return (
      <NumberField
        label={label}
        value={values[0]}
        onChange={onChangeAll}
        min={min}
        max={max}
        step={step}
        help={help}
      />
    );
  }

  return (
    <div className="rounded-[11px] p-2.5 border-[1.5px] border-[#eef0f6] bg-[#f8f9fc]">
      <div className="text-[12px] font-semibold text-[#1a1a2e] font-[Lato,sans-serif] mb-1.5">
        {label}{help && <InfoIcon tooltip={help} />}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {([1, 2, 3] as const).map((p) => (
          <div key={p}>
            <span className="text-[9px] font-bold text-[#9ca3af] block mb-0.5">Phase {p}</span>
            <CardNumberInput
              value={values[p - 1]}
              onChange={(v) => onChange(p, v)}
              min={min}
              max={max}
              step={step}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SliderField ─── sensitivity slider with gradient bar ─── */
export function SliderField({ label, value, onChange, min = -100, max = 100, step = 1, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const zeroAt = min < 0 && max > 0 ? ((-min) / range) * 100 : null;

  return (
    <div className="rounded-[11px] p-2.5 border-[1.5px] border-[#eef0f6] bg-[#f8f9fc]">
      <div className="flex items-center justify-between mb-2">
        <span className="flex-1 min-w-0 text-[12px] font-semibold text-[#1a1a2e] font-[Lato,sans-serif]">
          {label}{help && <InfoIcon tooltip={help} />}
        </span>
        <span className={`text-[12px] font-bold tabular-nums min-w-[40px] text-right ${
          value > 0 ? "text-[#2163E7]" : value < 0 ? "text-[#e74c3c]" : "text-[#8181A5]"
        }`}>
          {value > 0 ? "+" : ""}{value}%
        </span>
      </div>
      <div className="relative h-[4px] rounded-full bg-[#eef0f6]">
        {zeroAt !== null ? (
          value >= 0 ? (
            <div className="absolute top-0 h-full rounded-full"
              style={{ left: `${zeroAt}%`, width: `${pct - zeroAt}%`, background: "linear-gradient(90deg, #7BA3F0, #2163E7)" }} />
          ) : (
            <div className="absolute top-0 h-full rounded-full"
              style={{ left: `${pct}%`, width: `${zeroAt - pct}%`, background: "linear-gradient(90deg, #e74c3c, #f0a0a0)" }} />
          )
        ) : (
          <div className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7BA3F0, #2163E7)" }} />
        )}
        {zeroAt !== null && (
          <div className="absolute top-1/2 -translate-y-1/2 w-[1.5px] h-[10px] bg-[#d0d0d8] rounded-full"
            style={{ left: `${zeroAt}%` }} />
        )}
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-1/2 -left-[7px] w-[calc(100%+14px)] -translate-y-1/2 opacity-0 cursor-pointer h-5 m-0" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#2163E7] border-[2.5px] border-white pointer-events-none"
          style={{ left: `${pct}%`, boxShadow: "0 2px 6px rgba(33,99,231,0.35)" }} />
      </div>
    </div>
  );
}

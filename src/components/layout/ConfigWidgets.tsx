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
  activePhase?: 1 | 2 | 3;
  onPhaseClick?: (phase: 1 | 2 | 3) => void;
  colors?: [string, string, string];
}

export function PhaseTimeline({
  phase1Dur,
  phase2Dur,
  totalMonths,
  activePhase,
  onPhaseClick,
  colors = ["#2275ed", "#85abf2", "#e8f0ff"],
}: PhaseTimelineProps) {
  const phase3Dur = totalMonths - phase1Dur - phase2Dur;
  const phases: { label: string; dur: number; color: string; id: 1 | 2 | 3 }[] = [
    { label: "P1", dur: phase1Dur, color: colors[0], id: 1 },
    { label: "P2", dur: phase2Dur, color: colors[1], id: 2 },
    { label: "P3", dur: phase3Dur, color: colors[2], id: 3 },
  ];

  return (
    <div className="w-full h-7 rounded-lg overflow-hidden flex">
      {phases.map((p) => {
        if (p.dur <= 0) return null;
        const pct = (p.dur / totalMonths) * 100;
        const isActive = !activePhase || activePhase === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPhaseClick?.(p.id)}
            className="h-full flex items-center justify-center cursor-pointer transition-opacity duration-200"
            style={{
              width: `${pct}%`,
              backgroundColor: p.color,
              opacity: isActive ? 1 : 0.5,
            }}
          >
            <span className={`text-[9px] font-bold whitespace-nowrap ${isLightColor(p.color) ? "text-[#1a1a2e]" : "text-white"}`}>
              {p.label}: {p.dur}mo
            </span>
          </button>
        );
      })}
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

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function RetentionFunnel({ steps }: RetentionFunnelProps) {
  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="flex flex-col gap-1 w-full">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.value / maxVal) * 100, 12);
        const light = isLightColor(step.color);
        return (
          <React.Fragment key={i}>
            <div
              className="h-6 rounded-lg flex items-center px-2 transition-all duration-300"
              style={{
                width: `${widthPct}%`,
                backgroundColor: step.color,
                minWidth: "60px",
              }}
            >
              <span
                className={`text-[10px] font-bold truncate ${
                  light ? "text-[#1a1a2e]" : "text-white"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-[10px] font-bold ml-auto pl-1 ${
                  light ? "text-[#1a1a2e]" : "text-white"
                }`}
              >
                {step.value}%
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center pl-2 h-2">
                <div className="w-px h-full bg-[#c4c9d8]" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── 8. PhasePresets ──────────────────────────────────────── */

interface PhasePresetsProps {
  onApply: (preset: "conservative" | "moderate" | "aggressive") => void;
}

const presetStyles = {
  conservative: {
    border: "#10B981",
    text: "#10B981",
    hoverBg: "#ecfdf5",
  },
  moderate: {
    border: "#2163E7",
    text: "#2163E7",
    hoverBg: "#EBF1FD",
  },
  aggressive: {
    border: "#F59E0B",
    text: "#F59E0B",
    hoverBg: "#FFFBEB",
  },
} as const;

export function PhasePresets({ onApply }: PhasePresetsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex gap-2">
      {(
        Object.keys(presetStyles) as Array<keyof typeof presetStyles>
      ).map((key) => {
        const s = presetStyles[key];
        const isHovered = hovered === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onApply(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className="rounded-lg px-3 py-1.5 text-[10.5px] font-bold transition-colors duration-150 cursor-pointer"
            style={{
              border: `1.5px solid ${s.border}`,
              color: s.text,
              backgroundColor: isHovered ? s.hoverBg : "transparent",
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
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

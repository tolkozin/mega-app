"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";
import type {
  ReportSettings,
  ReportTemplate,
  ReportSectionKey,
} from "@/lib/types";

/* ─── Props ─── */

interface ReportTabProps {
  settings: ReportSettings;
  onChange: (settings: ReportSettings) => void;
  onGenerate: () => void;
  generating?: boolean;
}

/* ─── Constants ─── */

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const cardStyle: React.CSSProperties = {
  boxShadow: CARD_SHADOW,
  fontFamily: FONT,
};

const INPUT_CLASS =
  "h-10 px-3 rounded-lg border border-[#e5e7eb] focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163e7]/20 outline-none text-sm w-full";

const TEMPLATES: {
  key: ReportTemplate;
  label: string;
  description: string;
  accent: string;
  preview: string;
}[] = [
  {
    key: "minimal",
    label: "Minimal",
    description: "Clean, light layout with blue accents",
    accent: "#2163E7",
    preview: "bg-white border-2 border-[#2163E7]",
  },
  {
    key: "corporate",
    label: "Corporate",
    description: "Professional look with dark header",
    accent: "#1a1a2e",
    preview: "bg-[#1a1a2e] border-2 border-[#1a1a2e]",
  },
  {
    key: "startup",
    label: "Startup",
    description: "Bold, modern with gradient accents",
    accent: "#7C3AED",
    preview: "bg-gradient-to-br from-[#7C3AED] to-[#2163E7] border-2 border-[#7C3AED]",
  },
];

const SECTION_LABELS: Record<ReportSectionKey, string> = {
  executiveSummary: "Executive Summary",
  milestones: "Key Milestones",
  pnl: "P&L Overview",
  cashFlow: "Cash Flow",
  engineMetrics: "Model Metrics",
  scores: "Health Scores",
  market: "Market Analysis",
  roadmap: "Roadmap",
};

const FONT_OPTIONS: { key: ReportSettings["fontFamily"]; label: string }[] = [
  { key: "helvetica", label: "Helvetica" },
  { key: "times", label: "Times" },
  { key: "courier", label: "Courier" },
];

const ACCENT_PRESETS = [
  "#2163E7",
  "#1a1a2e",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#EA580C",
  "#0891B2",
  "#4F46E5",
];

/* ─── Template Selector ─── */

function TemplateSelector({
  selected,
  onSelect,
}: {
  selected: ReportTemplate;
  onSelect: (template: ReportTemplate) => void;
}) {
  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATES.map((tmpl) => {
          const isActive = selected === tmpl.key;
          return (
            <button
              key={tmpl.key}
              type="button"
              onClick={() => onSelect(tmpl.key)}
              className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                isActive
                  ? "border-[#2163E7] bg-[#f0f4ff]"
                  : "border-[#e5e7eb] hover:border-[#c7cfe0]"
              }`}
            >
              {/* Preview strip */}
              <div
                className={`w-full h-16 rounded-lg mb-3 ${tmpl.preview}`}
              >
                <div className="p-2 space-y-1">
                  <div
                    className="h-2 w-3/4 rounded-full"
                    style={{
                      backgroundColor:
                        tmpl.key === "minimal" ? "#e5e7eb" : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <div
                    className="h-1.5 w-1/2 rounded-full"
                    style={{
                      backgroundColor:
                        tmpl.key === "minimal" ? "#e5e7eb" : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-4 flex-1 rounded"
                        style={{
                          backgroundColor:
                            tmpl.key === "minimal"
                              ? "#f0f1f7"
                              : "rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <span
                className="text-[13px] font-bold text-[#1a1a2e] block"
                style={{ fontFamily: FONT }}
              >
                {tmpl.label}
              </span>
              <span
                className="text-[11px] text-[#9ca3af]"
                style={{ fontFamily: FONT }}
              >
                {tmpl.description}
              </span>

              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#2163E7] rounded-full flex items-center justify-center">
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 6l2 2 4-4"
                      stroke="white"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Customization Card ─── */

function CustomizationCard({
  settings,
  onChange,
}: {
  settings: ReportSettings;
  onChange: (settings: ReportSettings) => void;
}) {
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [settings, onChange],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.06 }}
      className="bg-white rounded-2xl p-6"
      style={cardStyle}
    >
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-5"
        style={{ fontFamily: FONT }}
      >
        Customization
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: FONT }}
          >
            Company Name
          </label>
          <input
            type="text"
            className={INPUT_CLASS}
            value={settings.companyName}
            onChange={(e) =>
              onChange({ ...settings, companyName: e.target.value })
            }
            placeholder="Your company name"
          />
        </div>

        {/* Font */}
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: FONT }}
          >
            Font
          </label>
          <select
            className={INPUT_CLASS}
            value={settings.fontFamily}
            onChange={(e) =>
              onChange({
                ...settings,
                fontFamily: e.target.value as ReportSettings["fontFamily"],
              })
            }
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Accent Color */}
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: FONT }}
          >
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-7 h-7 rounded-lg transition-all ${
                    settings.accentColor === color
                      ? "ring-2 ring-offset-1 ring-[#2163E7] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange({ ...settings, accentColor: color })}
                />
              ))}
            </div>
            <input
              type="color"
              className="w-7 h-7 rounded cursor-pointer border-0 p-0"
              value={settings.accentColor}
              onChange={(e) =>
                onChange({ ...settings, accentColor: e.target.value })
              }
            />
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: FONT }}
          >
            Logo
          </label>
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <div className="relative">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-10 w-auto max-w-[120px] object-contain rounded"
                />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white rounded-full text-[10px] flex items-center justify-center"
                  onClick={() => onChange({ ...settings, logoUrl: null })}
                >
                  &times;
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border border-[#e5e7eb] rounded-lg px-3 py-2 hover:bg-[#f8f9fc] transition-colors">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2v8M5 7l3 3 3-3" />
                  <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
                </svg>
                <span
                  className="text-[12px] text-[#6b7280]"
                  style={{ fontFamily: FONT }}
                >
                  Upload Logo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section Toggle Card ─── */

function SectionsCard({
  settings,
  onChange,
}: {
  settings: ReportSettings;
  onChange: (settings: ReportSettings) => void;
}) {
  const handleToggle = useCallback(
    (key: ReportSectionKey) => {
      onChange({
        ...settings,
        sections: { ...settings.sections, [key]: !settings.sections[key] },
      });
    },
    [settings, onChange],
  );

  const handleMove = useCallback(
    (index: number, direction: -1 | 1) => {
      const newOrder = [...settings.sectionOrder];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
      [newOrder[index], newOrder[targetIndex]] = [
        newOrder[targetIndex],
        newOrder[index],
      ];
      onChange({ ...settings, sectionOrder: newOrder });
    },
    [settings, onChange],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.1 }}
      className="bg-white rounded-2xl p-6"
      style={cardStyle}
    >
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Sections
      </h3>
      <p
        className="text-[11px] text-[#9ca3af] mb-4"
        style={{ fontFamily: FONT }}
      >
        Toggle sections and drag to reorder
      </p>

      <div className="space-y-1">
        {settings.sectionOrder.map((key, index) => {
          const enabled = settings.sections[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                enabled
                  ? "bg-[#f8f9fc] border border-[#e5e7eb]"
                  : "bg-white border border-[#f0f1f7] opacity-50"
              }`}
            >
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="text-[#9ca3af] hover:text-[#1a1a2e] transition-colors text-[10px] leading-none"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                >
                  &#9650;
                </button>
                <button
                  type="button"
                  className="text-[#9ca3af] hover:text-[#1a1a2e] transition-colors text-[10px] leading-none"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === settings.sectionOrder.length - 1}
                >
                  &#9660;
                </button>
              </div>

              {/* Section name */}
              <span
                className="flex-1 text-[12px] font-semibold text-[#1a1a2e]"
                style={{ fontFamily: FONT }}
              >
                {SECTION_LABELS[key]}
              </span>

              {/* Toggle */}
              <button
                type="button"
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  enabled ? "bg-[#2163E7]" : "bg-[#d1d5db]"
                }`}
                onClick={() => handleToggle(key)}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    enabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Generate Button ─── */

function GenerateCard({
  onGenerate,
  generating,
}: {
  onGenerate: () => void;
  generating?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.14 }}
      className="bg-white rounded-2xl p-6"
      style={cardStyle}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <h3
            className="text-[15px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: FONT }}
          >
            Generate Report
          </h3>
          <p
            className="text-[11px] text-[#9ca3af] mt-1"
            style={{ fontFamily: FONT }}
          >
            Download your customized PDF report with selected sections and
            styling.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 h-10 px-5 text-[13px] font-bold text-white bg-[#2163E7] rounded-xl hover:bg-[#1a53c7] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v8M5 7l3 3 3-3" />
                <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function ReportTab({
  settings,
  onChange,
  onGenerate,
  generating,
}: ReportTabProps) {
  const handleTemplateSelect = useCallback(
    (template: ReportTemplate) => {
      const tmpl = TEMPLATES.find((t) => t.key === template);
      onChange({
        ...settings,
        template,
        accentColor: tmpl?.accent ?? settings.accentColor,
      });
    },
    [settings, onChange],
  );

  return (
    <div className="space-y-6" style={{ fontFamily: FONT }}>
      <TemplateSelector
        selected={settings.template}
        onSelect={handleTemplateSelect}
      />
      <CustomizationCard settings={settings} onChange={onChange} />
      <SectionsCard settings={settings} onChange={onChange} />
      <GenerateCard onGenerate={onGenerate} generating={generating} />
    </div>
  );
}

export default ReportTab;

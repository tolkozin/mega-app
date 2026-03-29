"use client";

import { useState } from "react";

// ─── Blog cover data ─────────────────────────────────────────────────────────

interface CoverData {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  icon: "churn" | "ecommerce" | "saas" | "mrr";
  metrics: { label: string; value: string; trend?: string }[];
  chartType: "line-down" | "line-up" | "bars" | "waterfall";
}

const covers: CoverData[] = [
  {
    slug: "churn-rate-calculation",
    title: "Churn Rate Calculation",
    subtitle: "Formulas, Benchmarks & Reduction Strategies",
    category: "SaaS Metrics",
    categoryColor: "#EF4444",
    icon: "churn",
    metrics: [
      { label: "Monthly Churn", value: "5.2%", trend: "-0.8%" },
      { label: "MRR Lost", value: "$12,400" },
      { label: "Net Revenue Retention", value: "94%" },
    ],
    chartType: "line-down",
  },
  {
    slug: "ecommerce-unit-economics",
    title: "E-commerce Unit Economics",
    subtitle: "AOV, CAC & LTV Explained",
    category: "E-commerce",
    categoryColor: "#0EA5E9",
    icon: "ecommerce",
    metrics: [
      { label: "LTV:CAC", value: "3.2x", trend: "+0.4x" },
      { label: "AOV", value: "$84" },
      { label: "CAC Payback", value: "4.2 mo" },
    ],
    chartType: "bars",
  },
  {
    slug: "saas-financial-modeling",
    title: "SaaS Financial Modeling",
    subtitle: "The Complete Guide for Founders & CFOs",
    category: "Financial Modeling",
    categoryColor: "#10B981",
    icon: "saas",
    metrics: [
      { label: "MRR", value: "$48,200", trend: "+12%" },
      { label: "Runway", value: "18 mo" },
      { label: "Gross Margin", value: "72%" },
    ],
    chartType: "line-up",
  },
  {
    slug: "understanding-mrr-metrics",
    title: "Monthly Recurring Revenue",
    subtitle: "How to Calculate & Track MRR",
    category: "SaaS Metrics",
    categoryColor: "#2163E7",
    icon: "mrr",
    metrics: [
      { label: "MRR", value: "$48,200", trend: "+$5,400" },
      { label: "New MRR", value: "$8,200" },
      { label: "Churned MRR", value: "-$2,800" },
    ],
    chartType: "waterfall",
  },
];

// ─── SVG Cover Component ─────────────────────────────────────────────────────

function CoverSVG({ cover }: { cover: CoverData }) {
  const W = 1200;
  const H = 630;

  // Chart paths by type
  const charts: Record<string, React.ReactNode> = {
    "line-down": (
      <g>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="700" y1={200 + i * 55} x2="1120" y2={200 + i * 55} stroke="#1E293B" strokeWidth="1" />
        ))}
        {/* Area */}
        <path
          d="M720,220 L770,235 L820,255 L870,290 L920,320 L970,360 L1020,385 L1070,410 L1100,420 L1100,420 L720,420 Z"
          fill="#EF4444" opacity="0.1"
        />
        {/* Line */}
        <polyline
          points="720,220 770,235 820,255 870,290 920,320 970,360 1020,385 1070,410 1100,420"
          fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Dots */}
        {[[720,220],[820,255],[920,320],[1020,385],[1100,420]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#EF4444" />
        ))}
      </g>
    ),
    "line-up": (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="700" y1={200 + i * 55} x2="1120" y2={200 + i * 55} stroke="#1E293B" strokeWidth="1" />
        ))}
        <path
          d="M720,420 L770,400 L820,370 L870,340 L920,300 L970,270 L1020,240 L1070,220 L1100,210 L1100,420 L720,420 Z"
          fill="#10B981" opacity="0.1"
        />
        <polyline
          points="720,420 770,400 820,370 870,340 920,300 970,270 1020,240 1070,220 1100,210"
          fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Dashed optimistic line */}
        <polyline
          points="720,420 770,390 820,350 870,305 920,260 970,225 1020,200 1070,185 1100,178"
          fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8 5" strokeLinecap="round"
        />
        {[[720,420],[870,340],[1020,240],[1100,210]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#10B981" />
        ))}
      </g>
    ),
    bars: (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="700" y1={200 + i * 55} x2="1120" y2={200 + i * 55} stroke="#1E293B" strokeWidth="1" />
        ))}
        {/* Bar groups */}
        {[
          { x: 720, h1: 120, h2: 80 },
          { x: 780, h1: 140, h2: 100 },
          { x: 840, h1: 100, h2: 130 },
          { x: 900, h1: 160, h2: 110 },
          { x: 960, h1: 180, h2: 90 },
          { x: 1020, h1: 200, h2: 70 },
          { x: 1080, h1: 190, h2: 60 },
        ].map(({ x, h1, h2 }, i) => (
          <g key={i}>
            <rect x={x} y={420 - h1} width="20" height={h1} rx="3" fill="#0EA5E9" opacity="0.8" />
            <rect x={x + 24} y={420 - h2} width="20" height={h2} rx="3" fill="#F59E0B" opacity="0.7" />
          </g>
        ))}
      </g>
    ),
    waterfall: (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="700" y1={200 + i * 55} x2="1120" y2={200 + i * 55} stroke="#1E293B" strokeWidth="1" />
        ))}
        {/* Waterfall bars */}
        {[
          { x: 720, y: 350, h: 70, color: "#64748B", label: "Start" },
          { x: 790, y: 280, h: 70, color: "#10B981", label: "New" },
          { x: 860, y: 250, h: 30, color: "#3B82F6", label: "Exp" },
          { x: 930, y: 270, h: 20, color: "#F59E0B", label: "Con" },
          { x: 1000, y: 250, h: 40, color: "#EF4444", label: "Churn" },
          { x: 1070, y: 290, h: 130, color: "#2163E7", label: "End" },
        ].map(({ x, y, h, color, label }, i) => (
          <g key={i}>
            <rect x={x} y={y} width="50" height={h} rx="4" fill={color} opacity="0.8" />
            <text x={x + 25} y={435} fill="#64748B" fontSize="10" fontFamily="Lato, sans-serif" textAnchor="middle">{label}</text>
          </g>
        ))}
        {/* Connecting lines */}
        <line x1="770" y1="350" x2="790" y2="350" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="840" y1="280" x2="860" y2="280" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="910" y1="250" x2="930" y2="250" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="980" y1="270" x2="1000" y2="270" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="1050" y1="290" x2="1070" y2="290" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
      </g>
    ),
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-auto rounded-xl border border-[#1E293B]">
      {/* Background */}
      <rect width={W} height={H} fill="#0F172A" />

      {/* Subtle grid pattern */}
      <defs>
        <pattern id={`grid-${cover.slug}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#grid-${cover.slug})`} />

      {/* Gradient overlay left side */}
      <defs>
        <linearGradient id={`grad-${cover.slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover.categoryColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#grad-${cover.slug})`} />

      {/* Revenue Map logo area */}
      <text x="60" y="60" fill="#64748B" fontSize="14" fontFamily="Lato, sans-serif" fontWeight="700" letterSpacing="0.05em">
        REVENUE MAP
      </text>

      {/* Category badge */}
      <rect x="60" y="80" width={cover.category.length * 10 + 24} height="28" rx="14" fill={cover.categoryColor} opacity="0.15" />
      <rect x="60" y="80" width={cover.category.length * 10 + 24} height="28" rx="14" fill="none" stroke={cover.categoryColor} strokeWidth="1" opacity="0.3" />
      <text x="72" y="99" fill={cover.categoryColor} fontSize="13" fontFamily="Lato, sans-serif" fontWeight="700">
        {cover.category}
      </text>

      {/* Title */}
      <text x="60" y="170" fill="#F8FAFC" fontSize="42" fontFamily="Lato, sans-serif" fontWeight="900" letterSpacing="-0.02em">
        {cover.title}
      </text>

      {/* Subtitle */}
      <text x="60" y="210" fill="#94A3B8" fontSize="20" fontFamily="Lato, sans-serif" fontWeight="400">
        {cover.subtitle}
      </text>

      {/* Metric cards */}
      {cover.metrics.map((m, i) => {
        const cardX = 60 + i * 195;
        const cardY = 260;
        return (
          <g key={i}>
            <rect x={cardX} y={cardY} width="180" height="85" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <text x={cardX + 16} y={cardY + 28} fill="#94A3B8" fontSize="12" fontFamily="Lato, sans-serif">
              {m.label}
            </text>
            <text x={cardX + 16} y={cardY + 58} fill="#F8FAFC" fontSize="26" fontFamily="Lato, sans-serif" fontWeight="700">
              {m.value}
            </text>
            {m.trend && (
              <>
                <rect x={cardX + 16} y={cardY + 64} width={m.trend.length * 8 + 12} height="16" rx="4" fill={m.trend.startsWith("-") ? "#7F1D1D" : "#064E3B"} />
                <text x={cardX + 22} y={cardY + 76} fill={m.trend.startsWith("-") ? "#FCA5A5" : "#6EE7B7"} fontSize="10" fontFamily="Lato, sans-serif" fontWeight="600">
                  {m.trend}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Chart area */}
      <rect x="680" y="170" width="460" height="300" rx="12" fill="#0D1117" stroke="#1E293B" strokeWidth="1" />
      {charts[cover.chartType]}

      {/* Bottom bar */}
      <rect x="0" y={H - 50} width={W} height="50" fill="#0F172A" />
      <line x1="0" y1={H - 50} x2={W} y2={H - 50} stroke="#1E293B" strokeWidth="1" />
      <text x="60" y={H - 20} fill="#475569" fontSize="13" fontFamily="Lato, sans-serif">
        revenuemap.app
      </text>
      <text x={W - 60} y={H - 20} fill="#475569" fontSize="13" fontFamily="Lato, sans-serif" textAnchor="end">
        Financial Modeling for SaaS &amp; E-commerce
      </text>
    </svg>
  );
}

// ─── Preview Page ────────────────────────────────────────────────────────────

export default function BlogCoversPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const downloadSVG = (slug: string) => {
    const el = document.getElementById(`cover-${slug}`);
    if (!el) return;
    const svg = el.outerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-cover.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-heading font-extrabold text-[#1a1a2e] mb-2">Blog Cover Images Preview</h1>
        <p className="text-[#6b7280] mb-8">1200 x 630px (1.91:1) — Click to enlarge, download SVG for conversion</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {covers.map((cover) => (
            <div key={cover.slug} className="space-y-3">
              <div
                className="cursor-pointer hover:ring-2 hover:ring-[#2163e7] rounded-xl transition-all"
                onClick={() => setSelected(selected === cover.slug ? null : cover.slug)}
              >
                <div id={`cover-${cover.slug}`}>
                  <CoverSVG cover={cover} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{cover.slug}</p>
                  <p className="text-xs text-[#6b7280]">public/blog/{cover.slug}/cover.jpg</p>
                </div>
                <button
                  onClick={() => downloadSVG(cover.slug)}
                  className="px-4 py-2 bg-white text-[#1a1a2e] text-sm rounded-lg border border-[#e5e7eb] hover:bg-[#f8f9fc] transition-colors"
                >
                  Download SVG
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen preview */}
        {selected && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
            onClick={() => setSelected(null)}
          >
            <div className="max-w-[1200px] w-full" onClick={(e) => e.stopPropagation()}>
              <CoverSVG cover={covers.find((c) => c.slug === selected)!} />
              <div className="flex justify-center mt-4 gap-4">
                <button
                  onClick={() => downloadSVG(selected)}
                  className="px-6 py-3 bg-[#2163e7] text-white rounded-lg hover:bg-[#1a4fc7] transition-colors"
                >
                  Download SVG
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 bg-white text-[#1a1a2e] rounded-lg border border-[#e5e7eb] hover:bg-[#f8f9fc] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-[#e5e7eb]">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">Converting to JPG</h2>
          <p className="text-sm text-[#6b7280] mb-3">After reviewing, convert SVGs to 1200x630 JPGs:</p>
          <pre className="bg-[#f8f9fc] p-4 rounded-lg text-sm text-[#1a1a2e] overflow-x-auto border border-[#e5e7eb]">
{`# Option 1: Using Inkscape (recommended)
for f in *.svg; do
  inkscape "$f" --export-type=png --export-width=1200 --export-height=630
  convert "\${f%.svg}.png" -quality 90 "\${f%.svg}.jpg"
done

# Option 2: Using Chrome headless
npx capture-website-cli --width=1200 --height=630 --type=jpeg cover.html`}
          </pre>
        </div>
      </div>
    </div>
  );
}

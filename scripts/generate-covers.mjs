#!/usr/bin/env node
/**
 * Generate blog cover + inline images (1200×630 JPG) from SVG templates.
 * Style: Periodic Table light theme — #f8f9fc bg, Commissioner headings, Roboto body.
 *
 * Usage: node scripts/generate-covers.mjs
 * Requires: npx playwright install chromium
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const PUBLIC = join(import.meta.dirname, "..", "public", "blog");
const W = 1200;
const H = 630;

// ─── Shared SVG building blocks ──────────────────────────────────────────────

function svgBackground(accentColor) {
  return `
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2163e7" stroke-width="0.5" opacity="0.04"/>
    </pattern>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#f8f9fc" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#f8f9fc"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#grad)"/>`;
}

function svgBranding() {
  return `<text x="60" y="60" fill="#6b7280" font-size="14" font-family="Roboto, sans-serif" font-weight="700" letter-spacing="0.05em">REVENUE MAP</text>`;
}

function svgCategoryBadge(label, color, y = 85) {
  const w = label.length * 9.5 + 24;
  return `
  <rect x="60" y="${y}" width="${w}" height="28" rx="14" fill="${color}" opacity="0.1"/>
  <rect x="60" y="${y}" width="${w}" height="28" rx="14" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
  <text x="72" y="${y + 19}" fill="${color}" font-size="13" font-family="Roboto, sans-serif" font-weight="700">${label}</text>`;
}

function svgFooter() {
  return `
  <rect x="0" y="580" width="${W}" height="50" fill="white"/>
  <line x1="0" y1="580" x2="${W}" y2="580" stroke="#e5e7eb" stroke-width="1"/>
  <text x="60" y="610" fill="#6b7280" font-size="13" font-family="Roboto, sans-serif">revenuemap.app</text>
  <text x="1140" y="610" fill="#6b7280" font-size="13" font-family="Roboto, sans-serif" text-anchor="end">Financial Modeling for SaaS &amp; E-commerce</text>`;
}

function svgTitle(text, y = 180, size = 42) {
  return `<text x="60" y="${y}" fill="#1a1a2e" font-size="${size}" font-family="Commissioner, sans-serif" font-weight="800" letter-spacing="-0.02em">${text}</text>`;
}

function svgSubtitle(text, y = 220, size = 20) {
  return `<text x="60" y="${y}" fill="#6b7280" font-size="${size}" font-family="Roboto, sans-serif">${text}</text>`;
}

function svgGridLines(x0 = 700, x1 = 1120, yStart = 200, gap = 55, count = 5) {
  return Array.from({ length: count }, (_, i) =>
    `<line x1="${x0}" y1="${yStart + i * gap}" x2="${x1}" y2="${yStart + i * gap}" stroke="#e5e7eb" stroke-width="1"/>`
  ).join("\n");
}

function svgMetricCards(metrics, startX = 60, startY = 280) {
  return metrics.map((m, i) => {
    const x = startX + i * 195;
    const y = startY;
    const trendBg = m.trendDir === "down" ? "#FEE2E2" : "#D1FAE5";
    const trendFg = m.trendDir === "down" ? "#DC2626" : "#059669";
    const trendEl = m.trend
      ? `<rect x="${x + 16}" y="${y + 66}" width="${m.trend.length * 8 + 14}" height="18" rx="4" fill="${trendBg}"/>
         <text x="${x + 23}" y="${y + 79}" fill="${trendFg}" font-size="11" font-family="Roboto, sans-serif" font-weight="600">${m.trend}</text>`
      : "";
    return `
      <rect x="${x}" y="${y}" width="180" height="95" rx="10" fill="white" stroke="#e5e7eb" stroke-width="1"/>
      <text x="${x + 16}" y="${y + 28}" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif">${m.label}</text>
      <text x="${x + 16}" y="${y + 58}" fill="#1a1a2e" font-size="28" font-family="Commissioner, sans-serif" font-weight="700">${m.value}</text>
      ${trendEl}`;
  }).join("\n");
}

// ─── Chart builders ──────────────────────────────────────────────────────────

function chartLineDown(color) {
  return `${svgGridLines()}
    <path d="M720,220 L770,235 L820,255 L870,290 L920,320 L970,360 L1020,385 L1070,410 L1100,420 L1100,420 L720,420 Z" fill="${color}" opacity="0.08"/>
    <polyline points="720,220 770,235 820,255 870,290 920,320 970,360 1020,385 1070,410 1100,420" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="720" cy="220" r="4" fill="${color}"/><circle cx="820" cy="255" r="4" fill="${color}"/>
    <circle cx="920" cy="320" r="4" fill="${color}"/><circle cx="1020" cy="385" r="4" fill="${color}"/>
    <circle cx="1100" cy="420" r="4" fill="${color}"/>`;
}

function chartLineUp(color) {
  return `${svgGridLines()}
    <path d="M720,420 L770,400 L820,370 L870,340 L920,300 L970,270 L1020,240 L1070,220 L1100,210 L1100,420 L720,420 Z" fill="${color}" opacity="0.08"/>
    <polyline points="720,420 770,400 820,370 870,340 920,300 970,270 1020,240 1070,220 1100,210" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="720,420 770,390 820,350 870,305 920,260 970,225 1020,200 1070,185 1100,178" fill="none" stroke="#2163e7" stroke-width="2" stroke-dasharray="8 5" stroke-linecap="round"/>
    <circle cx="720" cy="420" r="4" fill="${color}"/><circle cx="870" cy="340" r="4" fill="${color}"/>
    <circle cx="1020" cy="240" r="4" fill="${color}"/><circle cx="1100" cy="210" r="4" fill="${color}"/>`;
}

function chartBars() {
  const bars = [
    { x: 720, h1: 120, h2: 80 }, { x: 780, h1: 140, h2: 100 }, { x: 840, h1: 100, h2: 130 },
    { x: 900, h1: 160, h2: 110 }, { x: 960, h1: 180, h2: 90 }, { x: 1020, h1: 200, h2: 70 },
    { x: 1080, h1: 190, h2: 60 },
  ].map(({ x, h1, h2 }) =>
    `<rect x="${x}" y="${420 - h1}" width="20" height="${h1}" rx="3" fill="#0EA5E9" opacity="0.7"/>
     <rect x="${x + 24}" y="${420 - h2}" width="20" height="${h2}" rx="3" fill="#F59E0B" opacity="0.6"/>`
  ).join("\n");
  return `${svgGridLines()}\n${bars}`;
}

function chartWaterfall() {
  const bars = [
    { x: 720, y: 350, h: 70, c: "#6b7280", l: "Start" },
    { x: 790, y: 280, h: 70, c: "#10B981", l: "New" },
    { x: 860, y: 250, h: 30, c: "#2163e7", l: "Exp" },
    { x: 930, y: 270, h: 20, c: "#F59E0B", l: "Con" },
    { x: 1000, y: 250, h: 40, c: "#EF4444", l: "Churn" },
    { x: 1070, y: 290, h: 130, c: "#5a3ee3", l: "End" },
  ].map(({ x, y, h, c, l }) =>
    `<rect x="${x}" y="${y}" width="50" height="${h}" rx="4" fill="${c}" opacity="0.7"/>
     <text x="${x + 25}" y="440" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">${l}</text>`
  ).join("\n");
  const connectors = [
    [770, 350, 790], [840, 280, 860], [910, 250, 930], [980, 270, 1000], [1050, 290, 1070],
  ].map(([x1, y, x2]) =>
    `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3 2"/>`
  ).join("\n");
  return `${svgGridLines()}\n${bars}\n${connectors}`;
}

const chartBuilders = {
  "line-down": chartLineDown,
  "line-up": chartLineUp,
  bars: chartBars,
  waterfall: chartWaterfall,
};

// ─── Cover SVG builder ───────────────────────────────────────────────────────

function buildCoverSVG(c) {
  const chart = typeof chartBuilders[c.chartType] === "function"
    ? (c.chartType === "bars" || c.chartType === "waterfall" ? chartBuilders[c.chartType]() : chartBuilders[c.chartType](c.chartColor))
    : "";

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgBackground(c.categoryColor)}
    ${svgBranding()}
    ${svgCategoryBadge(c.category, c.categoryColor)}
    ${svgTitle(c.title)}
    ${svgSubtitle(c.subtitle)}
    ${svgMetricCards(c.metrics)}
    <rect x="680" y="170" width="460" height="300" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    ${chart}
    ${svgFooter()}
  </svg>`;
}

// ─── Cover data ──────────────────────────────────────────────────────────────

const covers = [
  {
    slug: "churn-rate-calculation",
    title: "Churn Rate Calculation",
    subtitle: "Formulas, Benchmarks & Reduction Strategies",
    category: "SaaS Metrics",
    categoryColor: "#EF4444",
    chartColor: "#EF4444",
    chartType: "line-down",
    metrics: [
      { label: "Monthly Churn", value: "5.2%", trend: "-0.8%", trendDir: "down" },
      { label: "MRR Lost", value: "$12,400" },
      { label: "Net Revenue Retention", value: "94%" },
    ],
  },
  {
    slug: "ecommerce-unit-economics",
    title: "E-commerce Unit Economics",
    subtitle: "AOV, CAC & LTV Explained",
    category: "E-commerce",
    categoryColor: "#0EA5E9",
    chartColor: "#0EA5E9",
    chartType: "bars",
    metrics: [
      { label: "LTV:CAC", value: "3.2x", trend: "+0.4x", trendDir: "up" },
      { label: "AOV", value: "$84" },
      { label: "CAC Payback", value: "4.2 mo" },
    ],
  },
  {
    slug: "saas-financial-modeling",
    title: "SaaS Financial Modeling",
    subtitle: "The Complete Guide for Founders & CFOs",
    category: "Financial Modeling",
    categoryColor: "#10B981",
    chartColor: "#10B981",
    chartType: "line-up",
    metrics: [
      { label: "MRR", value: "$48,200", trend: "+12%", trendDir: "up" },
      { label: "Runway", value: "18 mo" },
      { label: "Gross Margin", value: "72%" },
    ],
  },
  {
    slug: "understanding-mrr-metrics",
    title: "Monthly Recurring Revenue",
    subtitle: "How to Calculate & Track MRR",
    category: "SaaS Metrics",
    categoryColor: "#5a3ee3",
    chartColor: "#5a3ee3",
    chartType: "waterfall",
    metrics: [
      { label: "MRR", value: "$48,200", trend: "+$5,400", trendDir: "up" },
      { label: "New MRR", value: "$8,200" },
      { label: "Churned MRR", value: "-$2,800" },
    ],
  },
  {
    slug: "mobile-app-financial-model",
    title: "Mobile App Financial Model",
    subtitle: "Revenue Projections & Unit Economics",
    category: "Financial Modeling",
    categoryColor: "#2163e7",
    chartColor: "#2163e7",
    chartType: "line-up",
    metrics: [
      { label: "ARPU", value: "$8.40", trend: "+12%", trendDir: "up" },
      { label: "Trial→Paid", value: "4.2%" },
      { label: "LTV", value: "$52" },
    ],
  },
  {
    slug: "marketplace-business-model",
    title: "Marketplace Financial Model",
    subtitle: "Take Rates, GMV & Liquidity Metrics",
    category: "Financial Modeling",
    categoryColor: "#317389",
    chartColor: "#0EA5E9",
    chartType: "line-up",
    metrics: [
      { label: "GMV", value: "$2.1M", trend: "+28%", trendDir: "up" },
      { label: "Take Rate", value: "14.5%" },
      { label: "Net Revenue", value: "$304K" },
    ],
  },
  {
    slug: "foodtech-unit-economics",
    title: "FoodTech Unit Economics",
    subtitle: "Per-Order Profitability & Break-Even",
    category: "E-commerce",
    categoryColor: "#c4292e",
    chartColor: "#EF4444",
    chartType: "bars",
    metrics: [
      { label: "AOV", value: "$28.50" },
      { label: "Contribution", value: "$4.20" },
      { label: "Break-even", value: "850 orders" },
    ],
  },
  {
    slug: "fintech-financial-model",
    title: "FinTech Financial Model",
    subtitle: "Transaction Revenue & Compliance Costs",
    category: "Financial Modeling",
    categoryColor: "#0e6b06",
    chartColor: "#10B981",
    chartType: "line-up",
    metrics: [
      { label: "TPV", value: "$4.8M", trend: "+34%", trendDir: "up" },
      { label: "Rev/Txn", value: "$0.42" },
      { label: "Compliance %", value: "18%" },
    ],
  },
  {
    slug: "healthtech-financial-model",
    title: "HealthTech Financial Model",
    subtitle: "Patient Acquisition & Revenue Projections",
    category: "Financial Modeling",
    categoryColor: "#b83e1d",
    chartColor: "#EC4899",
    chartType: "line-up",
    metrics: [
      { label: "Patient LTV", value: "$1,840", trend: "+8%", trendDir: "up" },
      { label: "PAC", value: "$320" },
      { label: "Gross Margin", value: "62%" },
    ],
  },
  {
    slug: "edtech-business-model",
    title: "EdTech Financial Model",
    subtitle: "Student Acquisition & Completion Rates",
    category: "Financial Modeling",
    categoryColor: "#8c591d",
    chartColor: "#F97316",
    chartType: "bars",
    metrics: [
      { label: "SAC", value: "$45" },
      { label: "Completion", value: "34%" },
      { label: "Student LTV", value: "$186" },
    ],
  },
  {
    slug: "ai-ml-startup-financial-model",
    title: "AI Startup Financial Model",
    subtitle: "Compute Costs & Revenue Scaling",
    category: "Financial Modeling",
    categoryColor: "#5a3ee3",
    chartColor: "#14B8A6",
    chartType: "line-up",
    metrics: [
      { label: "Gross Margin", value: "58%", trend: "+6%", trendDir: "up" },
      { label: "Cost/Inference", value: "$0.003" },
      { label: "Monthly Rev", value: "$82K" },
    ],
  },
  {
    slug: "proptech-financial-model",
    title: "PropTech Financial Model",
    subtitle: "Deal Economics & Listing-to-Close Metrics",
    category: "Financial Modeling",
    categoryColor: "#3e374d",
    chartColor: "#6366F1",
    chartType: "bars",
    metrics: [
      { label: "Rev/Deal", value: "$8,750" },
      { label: "Close Rate", value: "3.8%" },
      { label: "Cost/Deal", value: "$1,240" },
    ],
  },
  {
    slug: "traveltech-financial-model",
    title: "TravelTech Financial Model",
    subtitle: "Seasonality & Commission Economics",
    category: "Financial Modeling",
    categoryColor: "#113352",
    chartColor: "#06B6D4",
    chartType: "line-up",
    metrics: [
      { label: "GBV", value: "$1.4M", trend: "+22%", trendDir: "up" },
      { label: "Net Take Rate", value: "12.8%" },
      { label: "Cancel Rate", value: "18%" },
    ],
  },
  {
    slug: "gametech-financial-model",
    title: "GameTech Financial Model",
    subtitle: "Player LTV & UA Economics",
    category: "Financial Modeling",
    categoryColor: "#bc335f",
    chartColor: "#A855F7",
    chartType: "line-up",
    metrics: [
      { label: "ARPDAU", value: "$0.06" },
      { label: "Player LTV", value: "$3.60" },
      { label: "LTV:CPI", value: "2.4x", trend: "+0.3x", trendDir: "up" },
    ],
  },
];

// ─── Inline image SVG builders ───────────────────────────────────────────────

function inlineChurnComparison() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgBackground("#EF4444")}
    ${svgBranding()}
    ${svgTitle("Customer vs Revenue Churn", 130, 36)}
    ${svgSubtitle("Side-by-side comparison of churn metric types", 160, 16)}

    <!-- Logo Churn Card -->
    <rect x="60" y="200" width="340" height="320" rx="14" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="80" y="236" fill="#EF4444" font-size="13" font-family="Roboto, sans-serif" font-weight="700">Logo Churn (Customer)</text>
    <text x="80" y="280" fill="#1a1a2e" font-size="36" font-family="Commissioner, sans-serif" font-weight="800">5.2%</text>
    <text x="80" y="310" fill="#6b7280" font-size="13" font-family="Roboto, sans-serif">monthly rate</text>
    <rect x="80" y="330" width="280" height="40" rx="8" fill="#f8f9fc"/>
    <text x="100" y="356" fill="#6b7280" font-size="12" font-family="Roboto, monospace">Lost Customers / Start Customers</text>
    <polyline points="80,420 120,410 160,415 200,400 240,395 280,405 320,410 360,420" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
    <text x="80" y="480" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">Counts every customer equally</text>
    <text x="80" y="498" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">regardless of plan value</text>

    <!-- MRR Churn Card -->
    <rect x="430" y="200" width="340" height="320" rx="14" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="450" y="236" fill="#F59E0B" font-size="13" font-family="Roboto, sans-serif" font-weight="700">MRR Churn (Revenue)</text>
    <text x="450" y="280" fill="#1a1a2e" font-size="36" font-family="Commissioner, sans-serif" font-weight="800">3.8%</text>
    <text x="450" y="310" fill="#6b7280" font-size="13" font-family="Roboto, sans-serif">monthly rate</text>
    <rect x="450" y="330" width="280" height="40" rx="8" fill="#f8f9fc"/>
    <text x="470" y="356" fill="#6b7280" font-size="12" font-family="Roboto, monospace">Lost MRR / Start MRR</text>
    <polyline points="450,420 490,415 530,408 570,400 610,405 650,395 690,390 730,385" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
    <text x="450" y="480" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">Weights by revenue —</text>
    <text x="450" y="498" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">losing a $10/mo ≠ $500/mo</text>

    <!-- NRR Card -->
    <rect x="800" y="200" width="340" height="320" rx="14" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="820" y="236" fill="#10B981" font-size="13" font-family="Roboto, sans-serif" font-weight="700">Net Revenue Retention</text>
    <text x="820" y="280" fill="#1a1a2e" font-size="36" font-family="Commissioner, sans-serif" font-weight="800">94%</text>
    <text x="820" y="310" fill="#6b7280" font-size="13" font-family="Roboto, sans-serif">monthly rate</text>
    <rect x="820" y="330" width="300" height="40" rx="8" fill="#f8f9fc"/>
    <text x="840" y="356" fill="#6b7280" font-size="12" font-family="Roboto, monospace">(Start + Exp - Con - Churn) / Start</text>
    <polyline points="820,420 860,418 900,415 940,410 980,408 1020,405 1060,400 1100,395" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
    <text x="820" y="480" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">Includes expansion — the gold</text>
    <text x="820" y="498" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">standard. Target: >100%</text>

    ${svgFooter()}
  </svg>`;
}

function inlineEcommerceFlow() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgBackground("#0EA5E9")}
    ${svgBranding()}
    ${svgTitle("Unit Economics Dependency Chain", 130, 36)}
    ${svgSubtitle("How AOV, LTV, and CAC connect to profitability", 160, 16)}

    <!-- AOV Box -->
    <rect x="60" y="220" width="220" height="140" rx="14" fill="white" stroke="#0EA5E9" stroke-width="2"/>
    <text x="170" y="260" fill="#0EA5E9" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">AOV</text>
    <text x="170" y="295" fill="#1a1a2e" font-size="32" font-family="Commissioner, sans-serif" font-weight="800" text-anchor="middle">$84</text>
    <text x="170" y="320" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" text-anchor="middle">Avg Order Value</text>
    <text x="170" y="345" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif" text-anchor="middle">Revenue per transaction</text>

    <line x1="280" y1="290" x2="360" y2="290" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)"/>
    <text x="320" y="278" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">× orders</text>
    <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6b7280"/></marker></defs>

    <!-- LTV Box -->
    <rect x="370" y="200" width="260" height="180" rx="14" fill="white" stroke="#10B981" stroke-width="2"/>
    <text x="500" y="240" fill="#10B981" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">LTV</text>
    <text x="500" y="285" fill="#1a1a2e" font-size="38" font-family="Commissioner, sans-serif" font-weight="800" text-anchor="middle">$252</text>
    <text x="500" y="310" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" text-anchor="middle">Lifetime Value</text>
    <text x="500" y="335" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif" text-anchor="middle">AOV × Frequency × Lifespan × Margin</text>
    <text x="500" y="368" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">$84 × 4.2 orders × 1.8 yrs × 40%</text>

    <line x1="630" y1="290" x2="710" y2="290" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)"/>
    <text x="670" y="278" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">÷ CAC</text>

    <!-- LTV:CAC Ratio Box -->
    <rect x="720" y="210" width="220" height="160" rx="14" fill="white" stroke="#5a3ee3" stroke-width="2"/>
    <text x="830" y="250" fill="#5a3ee3" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">LTV : CAC</text>
    <text x="830" y="295" fill="#1a1a2e" font-size="38" font-family="Commissioner, sans-serif" font-weight="800" text-anchor="middle">3.2x</text>
    <text x="830" y="320" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" text-anchor="middle">Profitability Ratio</text>
    <rect x="775" y="338" width="110" height="20" rx="4" fill="#D1FAE5"/>
    <text x="830" y="353" fill="#059669" font-size="11" font-family="Roboto, sans-serif" text-anchor="middle" font-weight="600">Healthy (>3x)</text>

    <!-- CAC Box -->
    <rect x="720" y="420" width="220" height="120" rx="14" fill="white" stroke="#EF4444" stroke-width="2"/>
    <text x="830" y="455" fill="#EF4444" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">CAC</text>
    <text x="830" y="490" fill="#1a1a2e" font-size="32" font-family="Commissioner, sans-serif" font-weight="800" text-anchor="middle">$79</text>
    <text x="830" y="515" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" text-anchor="middle">Cost to Acquire</text>
    <line x1="830" y1="420" x2="830" y2="375" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)"/>

    <!-- Benchmark bar -->
    <rect x="60" y="430" width="580" height="110" rx="14" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="80" y="460" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" font-weight="700">LTV:CAC Benchmarks</text>
    <rect x="80" y="475" width="540" height="8" rx="4" fill="#f0f0f0"/>
    <rect x="80" y="475" width="90" height="8" rx="4" fill="#EF4444" opacity="0.7"/>
    <rect x="170" y="475" width="180" height="8" rx="4" fill="#F59E0B" opacity="0.7"/>
    <rect x="350" y="475" width="270" height="8" rx="4" fill="#10B981" opacity="0.7"/>
    <text x="125" y="500" fill="#EF4444" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">&lt;1x</text>
    <text x="260" y="500" fill="#F59E0B" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">1–3x</text>
    <text x="485" y="500" fill="#10B981" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">3x+ (target)</text>
    <text x="80" y="525" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif">Losing money</text>
    <text x="350" y="525" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif">Sustainable</text>
    <text x="540" y="525" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif">Scalable</text>

    ${svgFooter()}
  </svg>`;
}

function inlineSaasModelLayers() {
  const layers = [
    { y: 200, color: "#10B981", label: "Revenue Layer", desc: "MRR waterfall, new/expansion/churn, pricing tiers, conversion rates", icon: "↗", metrics: "MRR · ARR · New MRR · Churn MRR" },
    { y: 300, color: "#2163e7", label: "Cost Layer", desc: "COGS, team costs, marketing spend, infrastructure, overhead", icon: "↙", metrics: "Gross Margin · OpEx · Burn Rate" },
    { y: 400, color: "#F59E0B", label: "Cash Layer", desc: "Cash balance, runway, cumulative profit, investment payback", icon: "◎", metrics: "Cash Balance · Runway · Cum. Profit" },
    { y: 500, color: "#5a3ee3", label: "Scenario Layer", desc: "Base / optimistic / pessimistic, Monte Carlo simulation ranges", icon: "◈", metrics: "P10 · P50 · P90 · Confidence" },
  ];

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgBackground("#10B981")}
    ${svgBranding()}
    ${svgTitle("Four Layers of a SaaS Model", 130, 36)}
    ${svgSubtitle("Each layer feeds into the next — build from the top down", 160, 16)}

    ${layers.map((l) => `
      <rect x="60" y="${l.y}" width="540" height="80" rx="12" fill="white" stroke="${l.color}" stroke-width="1.5"/>
      <rect x="76" y="${l.y + 16}" width="40" height="40" rx="8" fill="${l.color}" opacity="0.1"/>
      <text x="96" y="${l.y + 44}" fill="${l.color}" font-size="22" font-family="Roboto, sans-serif" text-anchor="middle">${l.icon}</text>
      <text x="132" y="${l.y + 32}" fill="#1a1a2e" font-size="16" font-family="Commissioner, sans-serif" font-weight="700">${l.label}</text>
      <text x="132" y="${l.y + 52}" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">${l.desc}</text>
      <text x="132" y="${l.y + 68}" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif">${l.metrics}</text>
      ${l.y < 500 ? `<line x1="330" y1="${l.y + 80}" x2="330" y2="${l.y + 100}" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="4 3"/>
      <polygon points="326,${l.y + 98} 330,${l.y + 104} 334,${l.y + 98}" fill="#e5e7eb"/>` : ""}
    `).join("\n")}

    <!-- Right side: output dashboard mockup -->
    <rect x="660" y="200" width="480" height="370" rx="14" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="680" y="230" fill="#6b7280" font-size="12" font-family="Roboto, sans-serif" font-weight="700">MODEL OUTPUT</text>

    <rect x="680" y="245" width="140" height="55" rx="8" fill="#f8f9fc" stroke="#e5e7eb" stroke-width="0.5"/>
    <text x="696" y="265" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">MRR</text>
    <text x="696" y="286" fill="#1a1a2e" font-size="18" font-family="Commissioner, sans-serif" font-weight="700">$48,200</text>
    <rect x="830" y="245" width="140" height="55" rx="8" fill="#f8f9fc" stroke="#e5e7eb" stroke-width="0.5"/>
    <text x="846" y="265" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">Runway</text>
    <text x="846" y="286" fill="#1a1a2e" font-size="18" font-family="Commissioner, sans-serif" font-weight="700">18 mo</text>
    <rect x="980" y="245" width="140" height="55" rx="8" fill="#f8f9fc" stroke="#e5e7eb" stroke-width="0.5"/>
    <text x="996" y="265" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">Gross Margin</text>
    <text x="996" y="286" fill="#1a1a2e" font-size="18" font-family="Commissioner, sans-serif" font-weight="700">72%</text>

    ${svgGridLines(680, 1120, 320, 40, 4)}
    <path d="M700,470 L750,458 L800,440 L850,418 L900,395 L950,375 L1000,360 L1050,348 L1100,340 L1100,470 L700,470 Z" fill="#10B981" opacity="0.08"/>
    <polyline points="700,470 750,458 800,440 850,418 900,395 950,375 1000,360 1050,348 1100,340" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
    <polyline points="700,470 750,462 800,450 850,435 900,422 950,412 1000,405 1050,400 1100,398" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4 3" stroke-linecap="round"/>
    <polyline points="700,470 750,450 800,425 850,395 900,360 950,330 1000,310 1050,298 1100,290" fill="none" stroke="#2163e7" stroke-width="1.5" stroke-dasharray="4 3" stroke-linecap="round"/>

    <line x1="700" y1="490" x2="720" y2="490" stroke="#10B981" stroke-width="2"/><text x="725" y="494" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">Base</text>
    <line x1="780" y1="490" x2="800" y2="490" stroke="#2163e7" stroke-width="1.5" stroke-dasharray="4 3"/><text x="805" y="494" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">Optimistic</text>
    <line x1="890" y1="490" x2="910" y2="490" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4 3"/><text x="915" y="494" fill="#6b7280" font-size="9" font-family="Roboto, sans-serif">Pessimistic</text>

    ${svgFooter()}
  </svg>`;
}

function inlineMrrWaterfall() {
  const barW = 120;
  const gap = 20;
  const baseY = 480;
  const items = [
    { label: "Starting MRR", value: "$42,800", h: 200, color: "#6b7280", sub: "Previous month end" },
    { label: "New MRR", value: "+$8,200", h: 80, color: "#10B981", sub: "New customers" },
    { label: "Expansion", value: "+$3,400", h: 34, color: "#2163e7", sub: "Upgrades & add-ons" },
    { label: "Reactivation", value: "+$600", h: 6, color: "#0EA5E9", sub: "Win-backs" },
    { label: "Contraction", value: "-$1,200", h: 12, color: "#F59E0B", sub: "Downgrades" },
    { label: "Churned", value: "-$5,600", h: 56, color: "#EF4444", sub: "Cancellations" },
    { label: "Ending MRR", value: "$48,200", h: 226, color: "#5a3ee3", sub: "This month end" },
  ];

  let runningY = baseY - items[0].h;
  const positions = [];
  positions.push({ ...items[0], x: 60, y: runningY, bottom: baseY });
  let topY = runningY;
  topY = topY - items[1].h;
  positions.push({ ...items[1], x: 60 + (barW + gap), y: topY, bottom: topY + items[1].h });
  topY = topY - items[2].h;
  positions.push({ ...items[2], x: 60 + 2 * (barW + gap), y: topY, bottom: topY + items[2].h });
  topY = topY - items[3].h;
  positions.push({ ...items[3], x: 60 + 3 * (barW + gap), y: topY, bottom: topY + items[3].h });
  positions.push({ ...items[4], x: 60 + 4 * (barW + gap), y: topY, bottom: topY + items[4].h });
  topY = topY + items[4].h;
  positions.push({ ...items[5], x: 60 + 5 * (barW + gap), y: topY, bottom: topY + items[5].h });
  topY = topY + items[5].h;
  positions.push({ ...items[6], x: 60 + 6 * (barW + gap), y: baseY - items[6].h, bottom: baseY });

  const barsAndLabels = positions.map((p, i) => `
    <rect x="${p.x}" y="${p.y}" width="${barW}" height="${p.h}" rx="6" fill="${p.color}" opacity="0.75"/>
    <text x="${p.x + barW / 2}" y="${p.y - 12}" fill="#1a1a2e" font-size="14" font-family="Commissioner, sans-serif" font-weight="700" text-anchor="middle">${p.value}</text>
    <text x="${p.x + barW / 2}" y="${baseY + 20}" fill="#1a1a2e" font-size="12" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${p.label}</text>
    <text x="${p.x + barW / 2}" y="${baseY + 36}" fill="#6b7280" font-size="10" font-family="Roboto, sans-serif" text-anchor="middle">${p.sub}</text>
    ${i > 0 && i < 6 ? `<line x1="${positions[i - 1].x + barW}" y1="${p.y + (i >= 4 ? 0 : p.h)}" x2="${p.x}" y2="${p.y + (i >= 4 ? 0 : p.h)}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 3"/>` : ""}
  `).join("\n");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgBackground("#5a3ee3")}
    ${svgBranding()}
    ${svgTitle("MRR Waterfall Breakdown", 100, 36)}
    ${svgSubtitle("Five movements that explain your monthly MRR change", 126, 16)}

    <line x1="50" y1="${baseY}" x2="1150" y2="${baseY}" stroke="#e5e7eb" stroke-width="1"/>

    ${barsAndLabels}

    <rect x="60" y="535" width="12" height="12" rx="2" fill="#10B981" opacity="0.7"/>
    <text x="78" y="546" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">Positive (New, Expansion, Reactivation)</text>
    <rect x="360" y="535" width="12" height="12" rx="2" fill="#EF4444" opacity="0.7"/>
    <text x="378" y="546" fill="#6b7280" font-size="11" font-family="Roboto, sans-serif">Negative (Contraction, Churned)</text>

    ${svgFooter()}
  </svg>`;
}

const inlineImages = [
  { slug: "churn-rate-calculation", file: "inline-01.jpg", builder: inlineChurnComparison },
  { slug: "ecommerce-unit-economics", file: "inline-01.jpg", builder: inlineEcommerceFlow },
  { slug: "saas-financial-modeling", file: "inline-01.jpg", builder: inlineSaasModelLayers },
  { slug: "understanding-mrr-metrics", file: "inline-01.jpg", builder: inlineMrrWaterfall },
];

// ─── Renderer ────────────────────────────────────────────────────────────────

async function renderToJPG(page, svgString, outputPath) {
  const html = `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Commissioner:wght@600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden;}</style>
</head><body>${svgString}</body></html>`;

  const tmpPath = outputPath.replace(".jpg", "_tmp.html");
  writeFileSync(tmpPath, html);
  await page.goto(`file://${tmpPath}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 92,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  unlinkSync(tmpPath);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  // Generate covers
  console.log("\n— Cover images —");
  for (const cover of covers) {
    const dir = join(PUBLIC, cover.slug);
    mkdirSync(dir, { recursive: true });
    const svg = buildCoverSVG(cover);
    await renderToJPG(page, svg, join(dir, "cover.jpg"));
    console.log(`  ✓ ${cover.slug}/cover.jpg`);
  }

  // Default cover
  const defaultSvg = buildCoverSVG({
    slug: "_default", title: "Revenue Map Blog", subtitle: "Financial Modeling Insights",
    category: "Blog", categoryColor: "#2163e7", chartColor: "#2163e7", chartType: "line-up",
    metrics: [{ label: "MRR Growth", value: "+18%" }, { label: "Runway", value: "24 mo" }, { label: "Gross Margin", value: "75%" }],
  });
  await renderToJPG(page, defaultSvg, join(PUBLIC, "default-cover.jpg"));
  console.log("  ✓ default-cover.jpg");

  // Generate inline images
  console.log("\n— Inline images —");
  for (const img of inlineImages) {
    const dir = join(PUBLIC, img.slug);
    mkdirSync(dir, { recursive: true });
    const svg = img.builder();
    await renderToJPG(page, svg, join(dir, img.file));
    console.log(`  ✓ ${img.slug}/${img.file}`);
  }

  await browser.close();
  console.log("\nDone! All images generated.");
}

main().catch(console.error);

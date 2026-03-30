/**
 * Investor PDF Report — generates directly from data using jsPDF primitives.
 * No html2canvas, no DOM capture. Charts drawn with jsPDF line/rect commands.
 */

import type { RunResult } from "./api";
import type { BaseEngine } from "./model-registry";
import { getModelDef } from "./model-registry";
import type { ReportSettings, ReportSectionKey, MarketData, RoadmapData } from "./types";
import { computeScores, getPhaseProgress, type ScoreResult, type PhaseInfo } from "./scoring";

// ─── Layout Constants (mm) ─────────────────────────────────────────────────────
const PW = 210;
const PH = 297;
const M = 15; // margin
const CW = PW - M * 2; // 180mm content width
const HEADER_H = 14;
const FOOTER_H = 8;
const Y_START = M + HEADER_H;
const Y_END = PH - M - FOOTER_H;
const SEC_GAP = 8;
const EL_GAP = 4;
const KPI_H = 18;
const CHART_H = 55;
const TABLE_HDR_H = 5.5;
const TABLE_ROW_H = 4.5;

// ─── Colors [R, G, B] ─────────────────────────────────────────────────────────
const CLR = {
  text: [28, 29, 33] as const,
  muted: [129, 129, 165] as const,
  accent: [33, 99, 231] as const,
  green: [16, 185, 129] as const,
  red: [239, 68, 68] as const,
  amber: [245, 158, 11] as const,
  border: [226, 226, 232] as const,
  cardBg: [247, 247, 250] as const,
  gridLine: [235, 235, 240] as const,
  white: [255, 255, 255] as const,
};

// ─── Format helpers ────────────────────────────────────────────────────────────
function n(v: unknown): number {
  const x = Number(v);
  return isNaN(x) || !isFinite(x) ? 0 : x;
}

function fC(v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}K`;
  return `${sign}$${a.toFixed(0)}`;
}

function fN(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fP(v: number): string {
  return `${v.toFixed(1)}%`;
}

function fMonth(v: number): string {
  return `Mo ${v.toFixed(0)}`;
}

// ─── PDF Builder ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDF = any; // jsPDF instance

class InvestorPDF {
  private pdf: PDF;
  private y = Y_START;
  private page = 1;
  private df: Record<string, number>[];
  private ms: Record<string, unknown>;
  private projectName: string;
  private modelType: string;
  private engine: BaseEngine;
  private modelLabel: string;
  private modelColor: string;
  private settings: ReportSettings | null;
  private marketData: MarketData | null;
  private roadmapData: RoadmapData | null;
  private accentRGB: readonly [number, number, number];

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JsPDF: any,
    projectName: string,
    modelType: string,
    engine: BaseEngine,
    data: RunResult,
    settings?: ReportSettings | null,
    marketData?: MarketData | null,
    roadmapData?: RoadmapData | null,
  ) {
    this.pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.projectName = projectName;
    this.modelType = modelType;
    this.engine = engine;
    this.df = (data.dataframe ?? []) as Record<string, number>[];
    this.ms = (data.milestones ?? {}) as Record<string, unknown>;
    const def = getModelDef(modelType);
    this.modelLabel = def.label;
    this.modelColor = def.color;
    this.settings = settings ?? null;
    this.marketData = marketData ?? null;
    this.roadmapData = roadmapData ?? null;

    // Parse accent color from hex
    const hex = settings?.accentColor ?? "#2163E7";
    const r = parseInt(hex.slice(1, 3), 16) || 33;
    const g = parseInt(hex.slice(3, 5), 16) || 99;
    const b = parseInt(hex.slice(5, 7), 16) || 231;
    this.accentRGB = [r, g, b] as const;

    // Apply font from settings
    if (settings?.fontFamily) {
      this.pdf.setFont(settings.fontFamily, "normal");
    }
  }

  // ── Core ──────────────────────────────────────────────────────────────────────

  private newPage() {
    this.pdf.addPage();
    this.page++;
    this.y = M + 6; // smaller top on continuation pages
  }

  private ensureSpace(needed: number) {
    if (this.y + needed > Y_END) this.newPage();
  }

  private setColor(c: readonly [number, number, number]) {
    this.pdf.setTextColor(c[0], c[1], c[2]);
  }

  private setFill(c: readonly [number, number, number]) {
    this.pdf.setFillColor(c[0], c[1], c[2]);
  }

  private setDraw(c: readonly [number, number, number]) {
    this.pdf.setDrawColor(c[0], c[1], c[2]);
  }

  // ── Drawing primitives ────────────────────────────────────────────────────────

  private text(str: string, x: number, y: number, opts?: { align?: "left" | "center" | "right"; maxWidth?: number }) {
    this.pdf.text(str, x, y, opts);
  }

  private hline(y: number, x1 = M, x2 = PW - M) {
    this.setDraw(CLR.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(x1, y, x2, y);
  }

  // ── Components ────────────────────────────────────────────────────────────────

  private sectionTitle(title: string) {
    this.ensureSpace(SEC_GAP + 6);
    this.y += SEC_GAP;
    this.pdf.setFont(this.font, "bold");
    this.pdf.setFontSize(11);
    this.setColor(CLR.text);
    this.text(title.toUpperCase(), M, this.y);
    this.y += 1.5;
    this.hline(this.y);
    this.y += EL_GAP;
  }

  private kpiRow(cards: { label: string; value: string; sub?: string }[]) {
    const count = cards.length;
    const gap = 3;
    const cardW = (CW - (count - 1) * gap) / count;
    this.ensureSpace(KPI_H);

    for (let i = 0; i < count; i++) {
      const x = M + i * (cardW + gap);
      // Card background
      this.setFill(CLR.cardBg);
      this.setDraw(CLR.border);
      this.pdf.setLineWidth(0.2);
      this.pdf.roundedRect(x, this.y, cardW, KPI_H, 1.5, 1.5, "FD");

      // Label
      this.pdf.setFont("helvetica", "normal");
      this.pdf.setFontSize(6.5);
      this.setColor(CLR.muted);
      this.text(cards[i].label, x + 3, this.y + 5);

      // Value
      this.pdf.setFont("helvetica", "bold");
      this.pdf.setFontSize(10);
      this.setColor(CLR.text);
      this.text(cards[i].value, x + 3, this.y + 11);

      // Sub
      if (cards[i].sub) {
        this.pdf.setFont("helvetica", "normal");
        this.pdf.setFontSize(5.5);
        this.setColor(CLR.muted);
        this.text(cards[i].sub!, x + 3, this.y + 15);
      }
    }
    this.y += KPI_H + EL_GAP;
  }

  private table(headers: string[], rows: string[][], colWidths?: number[]) {
    if (!rows.length) return;
    const cols = headers.length;
    const widths = colWidths ?? headers.map(() => CW / cols);

    const drawHeaderRow = () => {
      this.setFill([240, 240, 245]);
      this.pdf.rect(M, this.y - 0.5, CW, TABLE_HDR_H, "F");
      this.pdf.setFont("helvetica", "bold");
      this.pdf.setFontSize(6.5);
      this.setColor(CLR.muted);
      let x = M + 2;
      for (let c = 0; c < cols; c++) {
        this.text(headers[c], x, this.y + 3.5);
        x += widths[c];
      }
      this.y += TABLE_HDR_H;
    };

    // Initial header
    this.ensureSpace(TABLE_HDR_H + TABLE_ROW_H * 2);
    drawHeaderRow();

    // Rows
    for (let r = 0; r < rows.length; r++) {
      if (this.y + TABLE_ROW_H > Y_END) {
        this.newPage();
        drawHeaderRow(); // repeat header on new page
      }

      // Alternating background
      if (r % 2 === 0) {
        this.setFill([252, 252, 254]);
        this.pdf.rect(M, this.y - 0.5, CW, TABLE_ROW_H, "F");
      }

      this.pdf.setFont("helvetica", "normal");
      this.pdf.setFontSize(6.5);
      this.setColor(CLR.text);
      let x = M + 2;
      for (let c = 0; c < cols; c++) {
        this.text(rows[r][c] ?? "—", x, this.y + 3);
        x += widths[c];
      }
      // Bottom border
      this.hline(this.y + TABLE_ROW_H - 0.5);
      this.y += TABLE_ROW_H;
    }
    this.y += EL_GAP;
  }

  private lineChart(
    title: string,
    months: number[],
    series: { values: number[]; color: readonly [number, number, number]; label: string }[],
    yFormat: "currency" | "number" | "percent" = "currency",
    height: number = CHART_H,
  ) {
    this.ensureSpace(height + 8);

    // Title
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(7.5);
    this.setColor(CLR.text);
    this.text(title, M, this.y + 4);
    this.y += 7;

    const chartLeft = M + 18;
    const chartRight = PW - M - 4;
    const chartW = chartRight - chartLeft;
    const chartTop = this.y;
    const chartH = height - 14;
    const chartBottom = chartTop + chartH;

    // Calculate Y range
    const allVals = series.flatMap((s) => s.values).filter((v) => isFinite(v));
    let yMin = Math.min(0, ...allVals);
    let yMax = Math.max(1, ...allVals);
    if (yMax === yMin) yMax = yMin + 1;
    const pad = (yMax - yMin) * 0.1;
    yMin -= pad;
    yMax += pad;
    const yRange = yMax - yMin;

    const toY = (v: number) => chartTop + ((yMax - v) / yRange) * chartH;
    const toX = (i: number) => chartLeft + (i / Math.max(1, months.length - 1)) * chartW;

    // Grid lines (5 horizontal)
    this.pdf.setLineWidth(0.15);
    this.setDraw(CLR.gridLine);
    const fmt = yFormat === "currency" ? fC : yFormat === "percent" ? fP : fN;
    for (let g = 0; g <= 4; g++) {
      const val = yMin + (yRange * g) / 4;
      const gy = toY(val);
      this.pdf.line(chartLeft, gy, chartRight, gy);
      // Y-axis label
      this.pdf.setFont("helvetica", "normal");
      this.pdf.setFontSize(5);
      this.setColor(CLR.muted);
      this.text(fmt(val), chartLeft - 2, gy + 1, { align: "right" });
    }

    // X-axis labels
    const step = Math.max(1, Math.ceil(months.length / 10));
    this.pdf.setFontSize(5);
    this.setColor(CLR.muted);
    for (let i = 0; i < months.length; i += step) {
      this.text(String(months[i]), toX(i), chartBottom + 3.5, { align: "center" });
    }
    // Always show last month
    if ((months.length - 1) % step !== 0) {
      this.text(String(months[months.length - 1]), toX(months.length - 1), chartBottom + 3.5, { align: "center" });
    }

    // Draw lines
    for (const s of series) {
      this.pdf.setLineWidth(0.5);
      this.setDraw(s.color);
      for (let i = 1; i < s.values.length; i++) {
        const v0 = isFinite(s.values[i - 1]) ? s.values[i - 1] : 0;
        const v1 = isFinite(s.values[i]) ? s.values[i] : 0;
        this.pdf.line(toX(i - 1), toY(v0), toX(i), toY(v1));
      }
    }

    // Legend
    const legendY = chartBottom + 6;
    let legendX = chartLeft;
    this.pdf.setFontSize(5.5);
    for (const s of series) {
      this.setFill(s.color);
      this.pdf.rect(legendX, legendY - 1.5, 3, 1.5, "F");
      this.setColor(CLR.text);
      this.pdf.setFont("helvetica", "normal");
      this.text(s.label, legendX + 4, legendY);
      legendX += this.pdf.getTextWidth(s.label) + 10;
    }

    this.y = legendY + EL_GAP;
  }

  // ── Sampling helper ───────────────────────────────────────────────────────────

  private sample(maxRows = 12): Record<string, number>[] {
    const df = this.df;
    if (!df.length) return [];
    const step = Math.max(1, Math.floor(df.length / maxRows));
    const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
    // Always keep the last month visible
    if (filtered.length > maxRows) {
      return [...filtered.slice(0, maxRows - 1), filtered[filtered.length - 1]];
    }
    return filtered;
  }

  private months(): number[] {
    return this.df.map((r) => n(r["Month"]));
  }

  private col(name: string): number[] {
    return this.df.map((r) => n(r[name]));
  }

  private last(): Record<string, number> {
    return this.df[this.df.length - 1] ?? {};
  }

  private first(): Record<string, number> {
    return this.df[0] ?? {};
  }

  private sum(col: string): number {
    return this.df.reduce((s, r) => s + n(r[col]), 0);
  }

  private avg(col: string): number {
    return this.df.length ? this.sum(col) / this.df.length : 0;
  }

  // ── Report Header (page 1 only) ──────────────────────────────────────────────

  private get font(): string {
    return this.settings?.fontFamily ?? "helvetica";
  }

  private get accent(): readonly [number, number, number] {
    return this.accentRGB;
  }

  private reportHeader() {
    const firstMonth = n(this.first()["Month"]);
    const lastMonth = n(this.last()["Month"]);
    const tmpl = this.settings?.template ?? "minimal";
    const companyName = this.settings?.companyName;

    if (tmpl === "corporate") {
      // Dark header bar
      this.setFill(CLR.text);
      this.pdf.rect(0, 0, PW, M + HEADER_H, "F");
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(16);
      this.setColor(CLR.white);
      this.text(this.projectName, M, M + 6);
      this.pdf.setFont(this.font, "normal");
      this.pdf.setFontSize(8);
      this.text(`Financial Report  ·  Month ${firstMonth}–${lastMonth}${companyName ? `  ·  ${companyName}` : ""}`, M, M + 11);
    } else if (tmpl === "startup") {
      // Accent gradient-ish header
      this.setFill(this.accent);
      this.pdf.rect(0, 0, PW, M + HEADER_H, "F");
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(16);
      this.setColor(CLR.white);
      this.text(this.projectName, M, M + 6);
      this.pdf.setFont(this.font, "normal");
      this.pdf.setFontSize(8);
      this.text(`Financial Report  ·  Month ${firstMonth}–${lastMonth}${companyName ? `  ·  ${companyName}` : ""}`, M, M + 11);
    } else {
      // Minimal (default)
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(16);
      this.setColor(CLR.text);
      this.text(this.projectName, M, M + 6);
      this.pdf.setFont(this.font, "normal");
      this.pdf.setFontSize(8);
      this.setColor(CLR.muted);
      this.text(`Financial Report  ·  Month ${firstMonth}–${lastMonth}${companyName ? `  ·  ${companyName}` : ""}`, M, M + 11);
    }

    // Logo (if provided as base64)
    if (this.settings?.logoUrl) {
      try {
        this.pdf.addImage(this.settings.logoUrl, "PNG", PW - M - 20, M + 1, 20, 10, undefined, "FAST");
      } catch { /* ignore logo errors */ }
    } else {
      // Model badge (right side)
      const badgeText = `${this.modelLabel} Model`;
      this.pdf.setFontSize(7);
      const badgeW = this.pdf.getTextWidth(badgeText) + 8;
      const badgeX = PW - M - badgeW;
      this.setFill(CLR.cardBg);
      this.setDraw(CLR.border);
      this.pdf.roundedRect(badgeX, M + 1, badgeW, 6, 3, 3, "FD");
      this.setColor(this.accent);
      this.pdf.setFont(this.font, "bold");
      this.text(badgeText, badgeX + 4, M + 5);
    }

    this.y = M + HEADER_H;
    if (tmpl === "minimal") this.hline(this.y - 2);
  }

  // ── Page Footer ───────────────────────────────────────────────────────────────

  private addFooters() {
    const total = this.pdf.getNumberOfPages();
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    for (let p = 1; p <= total; p++) {
      this.pdf.setPage(p);
      this.pdf.setFontSize(6);
      this.pdf.setFont("helvetica", "normal");
      this.setColor(CLR.muted);
      this.text(`Generated ${date}  ·  Confidential`, M, PH - M);
      this.text(`${p} / ${total}`, PW - M, PH - M, { align: "right" });
    }
  }

  // ── Shared Sections ───────────────────────────────────────────────────────────

  private executiveSummary() {
    const revKey = this.engine === "subscription" ? "Total Gross Revenue" : "Gross Revenue";
    const totalRev = this.sum(revKey);
    const totalProfit = this.sum("Net Profit");
    const endCash = n(this.last()["Cash Balance"]);
    const rawAvgGM = this.avg("Gross Margin %");
    // Subscription stores GM as 0-1 fraction; ecommerce/saas store as 0-100
    const avgGM = this.engine === "subscription" ? rawAvgGM * 100 : rawAvgGM;
    const runway = n(this.last()["Runway (Months)"]);

    this.sectionTitle("Executive Summary");
    this.kpiRow([
      { label: "Total Revenue", value: fC(totalRev), sub: `${this.df.length} months` },
      { label: "Net Profit / (Loss)", value: fC(totalProfit), sub: "cumulative" },
      { label: "Ending Cash", value: fC(endCash), sub: runway > 0 ? `${fN(runway)} mo runway` : "∞ runway" },
      { label: "Avg Gross Margin", value: fP(avgGM), sub: undefined },
    ]);

    // Revenue chart
    this.lineChart(
      "Monthly Revenue",
      this.months(),
      [{ values: this.col(revKey), color: CLR.accent, label: "Revenue" }],
      "currency",
    );
  }

  private milestones() {
    this.sectionTitle("Key Milestones");
    const fms = (v: unknown) => (v === null || v === undefined ? "—" : `Month ${v}`);
    const ms = this.ms;

    let items: [string, string][];
    if (this.engine === "subscription") {
      items = [
        ["Break-Even (P&L)", fms(ms.break_even_month)],
        ["Cumulative Break-Even", fms(ms.cumulative_break_even)],
        ["Cash-Flow Positive", fms(ms.cf_positive_month)],
        ["Runway Out", fms(ms.runway_out_month)],
        ["1,000 Users", fms(ms.users_1000)],
        ["10,000 Users", fms(ms.users_10000)],
        ["MRR $10K", fms(ms.mrr_10000)],
        ["MRR $100K", fms(ms.mrr_100000)],
      ];
    } else if (this.engine === "ecommerce") {
      items = [
        ["Break-Even (P&L)", fms(ms.break_even_month)],
        ["Cumulative Break-Even", fms(ms.cumulative_break_even)],
        ["Cash-Flow Positive", fms(ms.cf_positive_month)],
        ["Runway Out", fms(ms.runway_out_month)],
        ["Investment Payback", fms(ms.investment_payback_month)],
      ];
    } else {
      items = [
        ["Break-Even (P&L)", fms(ms.break_even_month)],
        ["Cumulative Break-Even", fms(ms.cumulative_break_even)],
        ["Cash-Flow Positive", fms(ms.cf_positive_month)],
        ["Runway Out", fms(ms.runway_out_month)],
        ["50 Customers", fms(ms.customers_50)],
        ["100 Customers", fms(ms.customers_100)],
        ["ARR $100K", fms(ms.arr_100000)],
        ["ARR $1M", fms(ms.arr_1000000)],
      ];
    }

    // Render as 2-column table
    const half = Math.ceil(items.length / 2);
    const left = items.slice(0, half);
    const right = items.slice(half);
    const rows = left.map((l, i) => [l[0], l[1], right[i]?.[0] ?? "", right[i]?.[1] ?? ""]);
    this.table(
      ["Milestone", "When", "Milestone", "When"],
      rows,
      [38, 18, 38, 18],
    );
  }

  private pnlTable() {
    this.sectionTitle("P&L Overview");
    const sampled = this.sample(12);
    const revKey = this.engine === "subscription" ? "Total Gross Revenue" : "Gross Revenue";
    const rows = sampled.map((r) => [
      fMonth(n(r["Month"])),
      fC(n(r[revKey])),
      fC(n(r["COGS"] ?? r["Total COGS"])),
      fC(n(r["Total Expenses"] ?? r["Total OpEx"])),
      fC(n(r["EBITDA"])),
      fC(n(r["Net Profit"])),
    ]);
    this.table(
      ["Month", "Revenue", "COGS", "OpEx", "EBITDA", "Net Profit"],
      rows,
      [22, 30, 30, 30, 34, 34],
    );
  }

  private cashFlow() {
    this.sectionTitle("Cash Flow");
    const sampled = this.sample(10);
    const rows = sampled.map((r) => {
      const burn = n(r["Burn Rate"]);
      const runway = n(r["Runway (Months)"]);
      return [
        fMonth(n(r["Month"])),
        burn > 0 ? fC(burn) : "—",
        fC(n(r["Cash Balance"])),
        fC(n(r["Cumulative Net Profit"])),
        runway > 0 ? `${runway.toFixed(0)} mo` : "∞",
      ];
    });
    this.table(
      ["Month", "Burn Rate", "Cash Balance", "Cum. Profit", "Runway"],
      rows,
      [22, 36, 40, 42, 40],
    );
  }

  // ── Subscription Sections ─────────────────────────────────────────────────────

  private subscriptionSections() {
    const last = this.last();
    const endMRR = n(last["Total MRR"]);
    const endARR = endMRR * 12;
    const activeUsers = n(last["Total Active Users"]);
    const arpu = n(last["ARPU"]);

    this.sectionTitle("Revenue & Growth");
    this.kpiRow([
      { label: "Ending MRR", value: fC(endMRR) },
      { label: "Ending ARR", value: fC(endARR) },
      { label: "Active Users", value: fN(activeUsers) },
      { label: "ARPU", value: fC(arpu) },
    ]);

    this.lineChart(
      "MRR Growth",
      this.months(),
      [{ values: this.col("Total MRR"), color: CLR.accent, label: "MRR" }],
      "currency",
    );

    // Revenue breakdown table
    const revSampled = this.sample(12);
    this.table(
      ["Month", "Total MRR", "ARR", "Weekly", "Monthly", "Annual", "Users"],
      revSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["Total MRR"])),
        fC(n(r["Total MRR"]) * 12),
        fC(n(r["MRR Weekly"])),
        fC(n(r["MRR Monthly"])),
        fC(n(r["MRR Annual"])),
        fN(n(r["Total Active Users"])),
      ]),
      [22, 26, 26, 26, 26, 26, 28],
    );

    // Unit economics
    const cac = n(last["Blended CAC"]);
    const ltv = n(last["LTV"]);
    const ltvCac = n(last["LTV/CAC"]);

    this.sectionTitle("Unit Economics");
    this.kpiRow([
      { label: "CAC", value: fC(cac) },
      { label: "LTV", value: fC(ltv) },
      { label: "LTV / CAC", value: ltvCac > 0 ? `${ltvCac.toFixed(1)}x` : "—" },
      { label: "Avg ROAS", value: fN(this.avg("Cumulative ROAS")) },
    ]);

    this.lineChart(
      "LTV / CAC Ratio",
      this.months(),
      [{ values: this.col("LTV/CAC"), color: CLR.green, label: "LTV/CAC" }],
      "number",
    );

    // Unit economics table
    const ueSampled = this.sample(10);
    this.table(
      ["Month", "LTV", "CAC", "LTV/CAC", "ARPU", "Gross Margin"],
      ueSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["LTV"])),
        fC(n(r["Blended CAC"])),
        `${n(r["LTV/CAC"]).toFixed(2)}x`,
        fC(n(r["ARPU"])),
        fP(n(r["Gross Margin %"]) * 100),
      ]),
      [22, 30, 30, 30, 34, 34],
    );

    // Churn & Retention
    const avgChurn = this.df.length > 1
      ? this.df.slice(1).reduce((s, r) => s + n(r["Blended Churn"]), 0) / (this.df.length - 1) * 100
      : 0;
    const endCRR = n(last["CRR %"]);
    const endNRR = n(last["NRR %"]);

    this.sectionTitle("Churn & Retention");
    this.kpiRow([
      { label: "Avg Monthly Churn", value: fP(avgChurn) },
      { label: "End CRR", value: fP(endCRR), sub: "customer retention" },
      { label: "End NRR", value: fP(endNRR), sub: "net revenue retention" },
      { label: "Quick Ratio", value: fN(n(last["Quick Ratio"])) },
    ]);

    this.lineChart(
      "Monthly Churn %",
      this.months(),
      [{ values: this.col("Monthly Churn %"), color: CLR.red, label: "Monthly Churn %" }],
      "percent",
    );

    // Churn table
    const churnSampled = this.sample(10);
    this.table(
      ["Month", "Monthly Churn", "CRR %", "New Users", "Active Users"],
      churnSampled.map((r) => [
        fMonth(n(r["Month"])),
        fP(n(r["Monthly Churn %"])),
        fP(n(r["CRR %"])),
        fN(n(r["New Paid Users"])),
        fN(n(r["Total Active Users"])),
      ]),
      [22, 36, 36, 42, 44],
    );
  }

  // ── Ecommerce Sections ────────────────────────────────────────────────────────

  private ecommerceSections() {
    const totalOrders = this.sum("Total Orders");
    const avgAOV = this.avg("AOV");
    const totalGMV = this.sum("Gross Revenue");
    const last = this.last();

    this.sectionTitle("Sales Overview");
    this.kpiRow([
      { label: "Total GMV", value: fC(totalGMV) },
      { label: "Total Orders", value: fN(totalOrders) },
      { label: "Avg AOV", value: fC(avgAOV) },
      { label: "Net Margin", value: fP(this.avg("Gross Margin %")) },
    ]);

    this.lineChart(
      "Monthly Orders",
      this.months(),
      [{ values: this.col("Total Orders"), color: CLR.accent, label: "Orders" }],
      "number",
    );

    // GMV table
    const gmvSampled = this.sample(10);
    this.table(
      ["Month", "Revenue", "Orders", "Net Profit"],
      gmvSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["Gross Revenue"])),
        fN(n(r["Total Orders"])),
        fC(n(r["Net Profit"])),
      ]),
      [30, 50, 50, 50],
    );

    // AOV & Conversion
    this.sectionTitle("AOV & Conversion");
    const avgAOVVal = this.avg("AOV");
    const endROI = n(last["ROI %"]);
    const endRoas = n(last["Cumulative ROAS"]);
    this.kpiRow([
      { label: "Avg AOV", value: fC(avgAOVVal) },
      { label: "End ROAS", value: `${endRoas.toFixed(1)}x` },
      { label: "End ROI", value: fP(endROI) },
      { label: "Avg GM", value: fP(this.avg("Gross Margin %")) },
    ]);

    const aovSampled = this.sample(10);
    this.table(
      ["Month", "AOV", "Orders", "Revenue", "GM%", "ROAS", "ROI"],
      aovSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["AOV"])),
        fN(n(r["Total Orders"])),
        fC(n(r["Gross Revenue"])),
        fP(n(r["Gross Margin %"])),
        `${n(r["ROAS"]).toFixed(1)}x`,
        `${n(r["ROI %"]).toFixed(0)}%`,
      ]),
      [22, 24, 24, 28, 24, 24, 24],
    );

    // Customer acquisition
    const cac = n(last["CAC"]);
    const ltv = n(last["LTV"]);
    const ltvCac = n(last["LTV/CAC"]);
    const roas = n(last["ROAS"]);

    this.sectionTitle("Customer Acquisition");
    this.kpiRow([
      { label: "End CAC", value: fC(cac) },
      { label: "End LTV", value: fC(ltv) },
      { label: "LTV / CAC", value: ltvCac > 0 ? `${ltvCac.toFixed(1)}x` : "—" },
      { label: "End ROAS", value: roas > 0 ? `${roas.toFixed(1)}x` : "—" },
    ]);

    this.lineChart(
      "ROAS Over Time",
      this.months(),
      [{ values: this.col("ROAS"), color: CLR.green, label: "ROAS" }],
      "number",
    );

    // Customer acquisition table
    const cacSampled = this.sample(10);
    this.table(
      ["Month", "CAC", "LTV", "LTV/CAC", "Ad Budget", "ROAS"],
      cacSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["CAC"])),
        fC(n(r["LTV"])),
        `${n(r["LTV/CAC"]).toFixed(2)}x`,
        fC(n(r["Ad Budget"])),
        `${n(r["ROAS"]).toFixed(1)}x`,
      ]),
      [22, 30, 30, 30, 34, 34],
    );

    // Gross Margin Analysis
    this.sectionTitle("Gross Margin Analysis");
    const gmSampled = this.sample(10);
    this.table(
      ["Month", "Revenue", "COGS", "Gross Profit", "GM%", "Net Profit"],
      gmSampled.map((r) => {
        const rev = n(r["Gross Revenue"]);
        const cogs2 = n(r["COGS"]);
        return [
          fMonth(n(r["Month"])),
          fC(rev),
          fC(cogs2),
          fC(rev - cogs2),
          fP(n(r["Gross Margin %"])),
          fC(n(r["Net Profit"])),
        ];
      }),
      [22, 30, 30, 34, 30, 34],
    );
  }

  // ── SaaS Sections ─────────────────────────────────────────────────────────────

  private saasSections() {
    const last = this.last();
    const endARR = n(last["ARR"]);
    const endMRR = n(last["Total MRR"]);
    const customers = n(last["Active Customers"]);
    const arpa = n(last["ARPA"]);

    this.sectionTitle("ARR Growth");
    this.kpiRow([
      { label: "Ending ARR", value: fC(endARR) },
      { label: "Ending MRR", value: fC(endMRR) },
      { label: "Active Customers", value: fN(customers) },
      { label: "ARPA", value: fC(arpa) },
    ]);

    this.lineChart(
      "Annual Recurring Revenue",
      this.months(),
      [{ values: this.col("ARR"), color: CLR.accent, label: "ARR" }],
      "currency",
    );

    // ARR progression table
    const arrSampled = this.sample(12);
    this.table(
      ["Month", "MRR", "ARR", "Customers", "Seats"],
      arrSampled.map((r) => [
        fMonth(n(r["Month"])),
        fC(n(r["Total MRR"])),
        fC(n(r["ARR"])),
        fN(n(r["Active Customers"])),
        fN(n(r["Active Seats"])),
      ]),
      [22, 36, 40, 42, 40],
    );

    // Retention
    const nrr = n(last["NRR %"]);
    const grr = n(last["GRR %"]);
    const quickRatio = n(last["Quick Ratio"]);
    const ltvCac = n(last["LTV/CAC"]);

    this.sectionTitle("Retention & Efficiency");
    this.kpiRow([
      { label: "NRR", value: nrr ? fP(nrr) : "—", sub: ">100% = expansion" },
      { label: "GRR", value: grr ? fP(grr) : "—" },
      { label: "Quick Ratio", value: isFinite(quickRatio) ? quickRatio.toFixed(2) : "—" },
      { label: "LTV / CAC", value: isFinite(ltvCac) ? `${ltvCac.toFixed(1)}x` : "—" },
    ]);

    this.lineChart(
      "Net Revenue Retention",
      this.months(),
      [{ values: this.col("NRR %"), color: CLR.green, label: "NRR %" }],
      "percent",
    );

    // Retention table
    const retSampled = this.sample(10);
    this.table(
      ["Month", "NRR", "GRR", "Quick Ratio", "Expansion", "Contraction", "Churned"],
      retSampled.map((r) => [
        fMonth(n(r["Month"])),
        n(r["NRR %"]) ? fP(n(r["NRR %"])) : "—",
        n(r["GRR %"]) ? fP(n(r["GRR %"])) : "—",
        isFinite(n(r["Quick Ratio"])) ? n(r["Quick Ratio"]).toFixed(2) : "—",
        fC(n(r["Expansion MRR"])),
        fC(n(r["Contraction MRR"])),
        fC(n(r["Churned MRR"])),
      ]),
      [22, 24, 24, 26, 28, 28, 28],
    );

    // SaaS efficiency metrics
    const rule40 = n(last["Rule of 40"]);
    const magicNum = n(last["Magic Number"]);
    const cac = n(last["CAC"]);

    this.sectionTitle("SaaS Metrics");
    this.kpiRow([
      { label: "Rule of 40", value: isFinite(rule40) ? fP(rule40) : "—", sub: ">40% healthy" },
      { label: "Magic Number", value: isFinite(magicNum) ? magicNum.toFixed(2) : "—", sub: ">0.75 good" },
      { label: "End CAC", value: fC(cac) },
      { label: "End LTV", value: fC(n(last["LTV"])) },
    ]);

    // Efficiency metrics table
    const effSampled = this.sample(10);
    this.table(
      ["Month", "Rule of 40", "Magic #", "LTV/CAC", "NRR", "CAC", "LTV"],
      effSampled.map((r) => [
        fMonth(n(r["Month"])),
        isFinite(n(r["Rule of 40"])) ? fP(n(r["Rule of 40"])) : "—",
        isFinite(n(r["Magic Number"])) ? n(r["Magic Number"]).toFixed(2) : "—",
        isFinite(n(r["LTV/CAC"])) ? `${n(r["LTV/CAC"]).toFixed(2)}x` : "—",
        n(r["NRR %"]) ? fP(n(r["NRR %"])) : "—",
        fC(n(r["CAC"])),
        fC(n(r["LTV"])),
      ]),
      [22, 26, 24, 26, 24, 28, 30],
    );

    // Pipeline
    const pipeSampled = this.sample(10);
    const pipeRows = pipeSampled.map((r) => [
      fMonth(n(r["Month"])),
      fN(n(r["Total Leads"])),
      fN(n(r["Demos"])),
      fN(n(r["New Deals"])),
      fC(n(r["CAC"])),
      n(r["Organic %"]) ? fP(n(r["Organic %"])) : "—",
    ]);
    if (pipeRows.length) {
      this.sectionTitle("Pipeline");
      this.table(
        ["Month", "Leads", "Demos", "Deals", "CAC", "Organic %"],
        pipeRows,
        [22, 30, 30, 30, 34, 34],
      );
    }
  }

  // ── New Sections: Scores, Market, Roadmap ──────────────────────────────────

  private scoresSection() {
    const dfRows = this.df as unknown as import("./scoring").DataRow[];
    const scores: ScoreResult = computeScores(dfRows, this.engine, this.modelType);

    this.sectionTitle("Health Scores");

    // Overall score KPI
    const healthLabel = scores.health === "good" ? "Good" : scores.health === "caution" ? "Caution" : scores.health === "bad" ? "Bad" : "N/A";
    this.kpiRow([
      { label: "Overall Score", value: `${scores.overall}/100`, sub: healthLabel },
    ]);

    // Breakdown table
    const rows = scores.breakdown.map((b) => [
      b.label,
      `${Math.round(b.score)}/100`,
      b.score >= 70 ? "Good" : b.score >= 40 ? "Caution" : "Bad",
    ]);
    if (rows.length) {
      this.table(
        ["Metric", "Score", "Status"],
        rows,
        [80, 50, 50],
      );
    }
  }

  private marketSection() {
    if (!this.marketData) return;
    const md = this.marketData;

    this.sectionTitle("Market Analysis");

    // TAM/SAM/SOM from regions
    if (md.regions && md.regions.length > 0) {
      let totalTam = 0, totalSam = 0, totalSom = 0;
      for (const r of md.regions) {
        totalTam += r.tam;
        totalSam += r.sam;
        totalSom += r.som;
      }
      this.kpiRow([
        { label: "TAM", value: fC(totalTam), sub: "Total Addressable Market" },
        { label: "SAM", value: fC(totalSam), sub: "Serviceable Addressable" },
        { label: "SOM", value: fC(totalSom), sub: "Serviceable Obtainable" },
      ]);

      // Region breakdown table
      if (md.regions.length > 1) {
        const regionRows = md.regions.map((r) => [
          r.name || "Unnamed",
          fC(r.tam),
          fC(r.sam),
          fC(r.som),
          r.source || "—",
        ]);
        this.table(
          ["Region", "TAM", "SAM", "SOM", "Source"],
          regionRows,
          [40, 30, 30, 30, 50],
        );
      }
    }

    // Competitors
    if (md.competitors && md.competitors.length > 0) {
      this.ensureSpace(20);
      this.y += 4;
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(9);
      this.setColor(CLR.text);
      this.text("Competitors", M, this.y);
      this.y += EL_GAP;

      const compRows = md.competitors.map((c) => [
        c.name || "—",
        c.price || "—",
        c.users || "—",
        c.diff || "—",
      ]);
      this.table(
        ["Name", "Price", "Users", "Differentiator"],
        compRows,
        [40, 30, 30, 80],
      );
    }

    // Audiences
    if (md.audiences && md.audiences.length > 0) {
      this.ensureSpace(20);
      this.y += 4;
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(9);
      this.setColor(CLR.text);
      this.text("Target Audiences", M, this.y);
      this.y += EL_GAP;

      const audRows = md.audiences.map((a) => [
        a.name || "—",
        a.age || "—",
        a.pain || "—",
      ]);
      this.table(
        ["Persona", "Age Range", "Pain Point"],
        audRows,
        [50, 30, 100],
      );
    }
  }

  private roadmapSection() {
    const dfRows = this.df as unknown as import("./scoring").DataRow[];
    const config = { total_months: this.df.length } as Record<string, unknown>;
    const phases: PhaseInfo[] = getPhaseProgress(config, dfRows);

    this.sectionTitle("Roadmap");

    // Phase overview table
    const phaseRows = phases.map((p) => [
      p.label,
      `Month ${p.startMonth}–${p.endMonth}`,
      p.status === "done" ? "Completed" : p.status === "active" ? "In Progress" : "Upcoming",
      `${Math.round(p.progress * 100)}%`,
    ]);
    this.table(
      ["Phase", "Duration", "Status", "Progress"],
      phaseRows,
      [35, 50, 50, 45],
    );

    // Custom milestones
    if (this.roadmapData?.milestones && this.roadmapData.milestones.length > 0) {
      this.ensureSpace(20);
      this.y += 4;
      this.pdf.setFont(this.font, "bold");
      this.pdf.setFontSize(9);
      this.setColor(CLR.text);
      this.text("Milestones", M, this.y);
      this.y += EL_GAP;

      const msRows = this.roadmapData.milestones.map((m) => [
        m.name || "—",
        `Month ${m.month}`,
        m.description || "—",
        m.type === "auto" ? "Auto" : "Custom",
      ]);
      this.table(
        ["Milestone", "Target", "Description", "Type"],
        msRows,
        [40, 25, 85, 30],
      );
    }
  }

  // ── Main Generator ────────────────────────────────────────────────────────────

  generate() {
    if (!this.df.length) return;

    this.reportHeader();

    // Determine section order
    const sectionOrder = this.settings?.sectionOrder ?? [
      "executiveSummary", "milestones", "pnl", "cashFlow", "engineMetrics", "scores", "market", "roadmap",
    ];
    const enabled = this.settings?.sections ?? {
      executiveSummary: true, milestones: true, pnl: true, cashFlow: true,
      engineMetrics: true, scores: true, market: true, roadmap: true,
    };

    const sectionMap: Record<ReportSectionKey, () => void> = {
      executiveSummary: () => this.executiveSummary(),
      milestones: () => this.milestones(),
      pnl: () => this.pnlTable(),
      cashFlow: () => this.cashFlow(),
      engineMetrics: () => {
        if (this.engine === "subscription") this.subscriptionSections();
        else if (this.engine === "ecommerce") this.ecommerceSections();
        else this.saasSections();
      },
      scores: () => this.scoresSection(),
      market: () => this.marketSection(),
      roadmap: () => this.roadmapSection(),
    };

    for (const key of sectionOrder) {
      if (enabled[key]) {
        sectionMap[key]();
      }
    }

    this.addFooters();
  }

  save(filename: string) {
    this.pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────────

export async function generateInvestorPDF(
  projectName: string,
  modelType: string,
  engine: BaseEngine,
  data: RunResult,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const builder = new InvestorPDF(jsPDF, projectName, modelType, engine, data);
  builder.generate();
  builder.save(`${projectName.replace(/\s+/g, "-")}-investor-report`);
}

export async function generateCustomPDF(
  projectName: string,
  modelType: string,
  engine: BaseEngine,
  data: RunResult,
  settings: ReportSettings,
  marketData?: MarketData | null,
  roadmapData?: RoadmapData | null,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const builder = new InvestorPDF(jsPDF, projectName, modelType, engine, data, settings, marketData, roadmapData);
  builder.generate();
  builder.save(`${projectName.replace(/\s+/g, "-")}-report`);
}

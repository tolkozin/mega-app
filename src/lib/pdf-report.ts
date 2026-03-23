/**
 * Investor PDF Report — generates directly from data using jsPDF primitives.
 * No html2canvas, no DOM capture. Charts drawn with jsPDF line/rect commands.
 */

import type { RunResult } from "./api";
import type { BaseEngine } from "./model-registry";
import { getModelDef } from "./model-registry";

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

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JsPDF: any,
    projectName: string,
    modelType: string,
    engine: BaseEngine,
    data: RunResult,
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
    this.pdf.setFont("helvetica", "bold");
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
    return df
      .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
      .slice(0, maxRows);
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

  private reportHeader() {
    const firstMonth = n(this.first()["Month"]);
    const lastMonth = n(this.last()["Month"]);

    // Project name
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(16);
    this.setColor(CLR.text);
    this.text(this.projectName, M, M + 6);

    // Subtitle
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(8);
    this.setColor(CLR.muted);
    this.text(`Financial Investor Report  ·  Month ${firstMonth}–${lastMonth}`, M, M + 11);

    // Model badge (right side)
    const badgeText = `${this.modelLabel} Model`;
    this.pdf.setFontSize(7);
    const badgeW = this.pdf.getTextWidth(badgeText) + 8;
    const badgeX = PW - M - badgeW;
    this.setFill(CLR.cardBg);
    this.setDraw(CLR.border);
    this.pdf.roundedRect(badgeX, M + 1, badgeW, 6, 3, 3, "FD");
    this.setColor(CLR.accent);
    this.pdf.setFont("helvetica", "bold");
    this.text(badgeText, badgeX + 4, M + 5);

    this.y = M + HEADER_H;
    this.hline(this.y - 2);
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
    const avgGM = this.avg("Gross Margin %");
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

    // Pipeline table
    const sampled = this.sample(10);
    const rows = sampled.map((r) => [
      fMonth(n(r["Month"])),
      fN(n(r["Total Leads"])),
      fN(n(r["Demos"])),
      fN(n(r["New Deals"])),
      fC(n(r["CAC"])),
      n(r["Organic %"]) ? fP(n(r["Organic %"])) : "—",
    ]);
    if (rows.length) {
      this.sectionTitle("Pipeline");
      this.table(
        ["Month", "Leads", "Demos", "Deals", "CAC", "Organic %"],
        rows,
        [22, 30, 30, 30, 34, 34],
      );
    }
  }

  // ── Main Generator ────────────────────────────────────────────────────────────

  generate() {
    if (!this.df.length) return;

    // Page 1: Header + Executive Summary
    this.reportHeader();
    this.executiveSummary();

    // Page 2+: Milestones + P&L
    this.milestones();
    this.pnlTable();

    // Cash Flow
    this.cashFlow();

    // Model-specific sections
    if (this.engine === "subscription") this.subscriptionSections();
    else if (this.engine === "ecommerce") this.ecommerceSections();
    else this.saasSections();

    // Add footers to all pages
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

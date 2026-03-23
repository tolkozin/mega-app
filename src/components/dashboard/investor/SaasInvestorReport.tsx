"use client";

import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { RunResult } from "@/lib/api";
import {
  InvestorReport,
  SectionHeader,
  Divider,
  KPIGrid,
  KPICard,
  CompactTable,
  ReportChart,
  gradientArea,
  CHART_COLORS,
} from "./InvestorReport";

interface SaasInvestorReportProps {
  projectName: string;
  data: RunResult;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function fmtMoney(v: unknown) {
  return formatCurrency(num(v));
}

// ─── ARR Growth Summary ───────────────────────────────────────────────────────

function ArrGrowthSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];
  const first = df[0];

  const startArr = num(first["ARR"]);
  const endArr = num(last["ARR"]);
  const arrGrowth =
    startArr > 0 ? ((endArr - startArr) / startArr) * 100 : null;

  const endMrr = num(last["Total MRR"]);
  const endCustomers = num(last["Active Customers"]);
  const endSeats = num(last["Active Seats"]);
  const arpa = num(last["ARPA"]);

  return (
    <div>
      <SectionHeader>ARR Growth Summary</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Ending ARR"
          value={fmtMoney(endArr)}
          sub={
            arrGrowth !== null
              ? `${arrGrowth.toFixed(0)}% growth over period`
              : "from 0"
          }
        />
        <KPICard
          label="Ending MRR"
          value={fmtMoney(endMrr)}
          sub="monthly recurring revenue"
        />
        <KPICard
          label="Active Customers"
          value={formatNumber(endCustomers)}
          sub={endSeats > 0 ? `${formatNumber(endSeats)} seats` : undefined}
        />
        <KPICard
          label="ARPA"
          value={`$${arpa.toFixed(0)}`}
          sub="avg revenue per account"
        />
      </KPIGrid>
      <div className="mt-3">
        <ReportChart
          size="small"
          data={[
            gradientArea(
              df.map((_, i) => i + 1),
              df.map(r => num(r["ARR"])),
              "ARR",
              CHART_COLORS.primary,
              CHART_COLORS.primaryLight,
            ) as Plotly.Data,
          ]}
          layout={{ title: { text: "Annual Recurring Revenue", font: { size: 13, color: "#8181A5" } } }}
        />
      </div>

      {/* ARR progression table */}
      {(() => {
        const step = Math.max(1, Math.floor(df.length / 12));
        const _filtered = df.filter(
            (_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1
          );
        const _sampled = _filtered.length > 12
          ? [..._filtered.slice(0, 11), _filtered[_filtered.length - 1]]
          : _filtered;
        const rows = _sampled.map((r) => {
            const prevIdx = Math.max(
              0,
              df.findIndex((x) => x["Month"] === r["Month"]) - 1
            );
            const prevArr = num(df[prevIdx]["ARR"]);
            const arr = num(r["ARR"]);
            const growth =
              prevArr > 0 ? ((arr - prevArr) / prevArr) * 100 : null;
            return [
              `Mo ${num(r["Month"]).toFixed(0)}`,
              fmtMoney(r["Total MRR"]),
              fmtMoney(arr),
              formatNumber(num(r["Active Customers"])),
              formatNumber(num(r["Active Seats"])),
              growth !== null ? `${growth.toFixed(1)}%` : "—",
            ];
          });

        return (
          <div className="mt-3">
            <CompactTable
              headers={["Month", "MRR", "ARR", "Customers", "Seats", "MoM ARR Growth"]}
              rows={rows}
            />
          </div>
        );
      })()}
    </div>
  );
}

// ─── NRR / GRR Table ─────────────────────────────────────────────────────────

function RetentionTable({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 12));
  const _filt = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const _samp = _filt.length > 12 ? [..._filt.slice(0, 11), _filt[_filt.length - 1]] : _filt;
  const rows = _samp.map((r) => {
      const nrr = num(r["NRR %"]);
      const grr = num(r["GRR %"]);
      const quickRatio = num(r["Quick Ratio"]);
      const churned = num(r["Churned MRR"]);
      const expansion = num(r["Expansion MRR"]);
      const contraction = num(r["Contraction MRR"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        nrr ? formatPercent(nrr) : "—",
        grr ? formatPercent(grr) : "—",
        isNaN(quickRatio) ? "—" : quickRatio.toFixed(2),
        fmtMoney(expansion),
        fmtMoney(contraction),
        fmtMoney(churned),
      ];
    });

  const last = df[df.length - 1];
  const avgNrr = df.reduce((s, r) => s + num(r["NRR %"]), 0) / df.length;
  const avgGrr = df.reduce((s, r) => s + num(r["GRR %"]), 0) / df.length;

  return (
    <div>
      <SectionHeader>NRR / GRR Retention</SectionHeader>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <KPICard
          label="Avg NRR"
          value={avgNrr ? formatPercent(avgNrr) : "—"}
          sub=">100% = net expansion"
        />
        <KPICard
          label="Avg GRR"
          value={avgGrr ? formatPercent(avgGrr) : "—"}
          sub="gross retention rate"
        />
        <KPICard
          label="End NRR"
          value={num(last["NRR %"]) ? formatPercent(num(last["NRR %"])) : "—"}
          sub="latest month"
        />
        <KPICard
          label="End GRR"
          value={num(last["GRR %"]) ? formatPercent(num(last["GRR %"])) : "—"}
          sub="latest month"
        />
      </div>
      <div className="mt-3 mb-3">
        <ReportChart
          size="small"
          data={[
            gradientArea(
              df.map((_, i) => i + 1),
              df.map((r) => num(r["NRR %"])),
              "NRR %",
              CHART_COLORS.primary,
              CHART_COLORS.primaryLight,
            ) as Plotly.Data,
          ]}
          layout={{ title: { text: "Net Revenue Retention", font: { size: 13, color: "#8181A5" } } }}
        />
      </div>
      <CompactTable
        headers={["Month", "NRR", "GRR", "Quick Ratio", "Expansion MRR", "Contraction MRR", "Churned MRR"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Pipeline Summary ─────────────────────────────────────────────────────────

function PipelineSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const totalLeads = df.reduce((s, r) => s + num(r["Total Leads"]), 0);
  const totalDemos = df.reduce((s, r) => s + num(r["Demos"]), 0);
  const totalDeals = df.reduce((s, r) => s + num(r["New Deals"]), 0);
  const leadToDemo =
    totalLeads > 0 ? ((totalDemos / totalLeads) * 100).toFixed(1) : "—";
  const demoToClose =
    totalDemos > 0 ? ((totalDeals / totalDemos) * 100).toFixed(1) : "—";

  const step = Math.max(1, Math.floor(df.length / 10));
  const _f2 = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const _s2 = _f2.length > 10 ? [..._f2.slice(0, 9), _f2[_f2.length - 1]] : _f2;
  const rows = _s2.map((r) => {
      const leads = num(r["Total Leads"]);
      const demos = num(r["Demos"]);
      const deals = num(r["New Deals"]);
      const cac = num(r["CAC"]);
      const organicPct = num(r["Organic %"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        formatNumber(leads),
        formatNumber(demos),
        formatNumber(deals),
        fmtMoney(cac),
        organicPct ? formatPercent(organicPct) : "—",
      ];
    });

  return (
    <div>
      <SectionHeader>Pipeline Summary</SectionHeader>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <KPICard
          label="Total Leads"
          value={formatNumber(totalLeads)}
          sub="all months combined"
        />
        <KPICard
          label="Total Demos"
          value={formatNumber(totalDemos)}
          sub={`${leadToDemo}% lead→demo`}
        />
        <KPICard
          label="Total Deals"
          value={formatNumber(totalDeals)}
          sub={`${demoToClose}% demo→close`}
        />
        <KPICard
          label="Win Rate"
          value={
            totalLeads > 0
              ? formatPercent((totalDeals / totalLeads) * 100)
              : "—"
          }
          sub="leads to closed deals"
        />
      </div>
      <div className="mt-3 mb-3">
        <ReportChart
          size="small"
          data={[
            {
              x: df.map((_, i) => i + 1),
              y: df.map((r) => num(r["Total Leads"])),
              type: "scatter",
              mode: "lines",
              name: "Leads",
              line: { color: CHART_COLORS.primary, width: 2 },
            } as Plotly.Data,
            {
              x: df.map((_, i) => i + 1),
              y: df.map((r) => num(r["New Deals"])),
              type: "scatter",
              mode: "lines",
              name: "Deals",
              line: { color: CHART_COLORS.green, width: 2 },
            } as Plotly.Data,
          ]}
          layout={{ title: { text: "Leads vs Closed Deals", font: { size: 13, color: "#8181A5" } } }}
        />
      </div>
      <CompactTable
        headers={["Month", "Leads", "Demos", "Deals", "CAC", "Organic %"]}
        rows={rows}
      />
    </div>
  );
}

// ─── SaaS Efficiency Metrics (Rule of 40, Magic Number, LTV/CAC) ─────────────

function SaasEfficiencyMetrics({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];

  const rule40 = num(last["Rule of 40"]);
  const magicNum = num(last["Magic Number"]);
  const ltvCac = num(last["LTV/CAC"]);
  const ltv = num(last["LTV"]);
  const cac = num(last["CAC"]);

  const avgRule40 = df.reduce((s, r) => s + num(r["Rule of 40"]), 0) / df.length;
  const avgMagicNum =
    df.reduce((s, r) => s + num(r["Magic Number"]), 0) / df.length;

  const step = Math.max(1, Math.floor(df.length / 10));
  const _f3 = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const _s3 = _f3.length > 10 ? [..._f3.slice(0, 9), _f3[_f3.length - 1]] : _f3;
  const rows = _s3.map((r) => {
      const r40 = num(r["Rule of 40"]);
      const mn = num(r["Magic Number"]);
      const lc = num(r["LTV/CAC"]);
      const nrr = num(r["NRR %"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        isNaN(r40) ? "—" : `${r40.toFixed(1)}%`,
        isNaN(mn) ? "—" : mn.toFixed(2),
        isNaN(lc) ? "—" : `${lc.toFixed(2)}x`,
        nrr ? formatPercent(nrr) : "—",
        fmtMoney(r["CAC"]),
        fmtMoney(r["LTV"]),
      ];
    });

  return (
    <div>
      <SectionHeader>SaaS Efficiency Metrics</SectionHeader>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <KPICard
          label="Rule of 40"
          value={isNaN(rule40) ? "—" : `${rule40.toFixed(1)}%`}
          sub={`avg ${isNaN(avgRule40) ? "—" : avgRule40.toFixed(1)}% · >40% is healthy`}
        />
        <KPICard
          label="Magic Number"
          value={isNaN(magicNum) ? "—" : magicNum.toFixed(2)}
          sub={`avg ${isNaN(avgMagicNum) ? "—" : avgMagicNum.toFixed(2)} · >0.75 is good`}
        />
        <KPICard
          label="LTV / CAC"
          value={isNaN(ltvCac) ? "—" : `${ltvCac.toFixed(2)}x`}
          sub={`LTV ${fmtMoney(ltv)}`}
        />
        <KPICard
          label="End CAC"
          value={`$${cac.toFixed(2)}`}
          sub="latest month"
        />
      </div>
      <div className="mt-3 mb-3">
        <ReportChart
          size="small"
          data={[
            {
              x: df.map((_, i) => i + 1),
              y: df.map((r) => num(r["Rule of 40"])),
              type: "scatter",
              mode: "lines",
              name: "Rule of 40",
              line: { color: CHART_COLORS.primary, width: 2 },
            } as Plotly.Data,
            {
              x: [1, df.length],
              y: [40, 40],
              type: "scatter",
              mode: "lines",
              name: "40% threshold",
              line: { color: CHART_COLORS.primary, width: 1, dash: "dash" },
              showlegend: false,
            } as Plotly.Data,
          ]}
          layout={{ title: { text: "Rule of 40", font: { size: 13, color: "#8181A5" } } }}
        />
      </div>
      <CompactTable
        headers={["Month", "Rule of 40", "Magic Number", "LTV/CAC", "NRR", "CAC", "LTV"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SaasInvestorReport({
  projectName,
  data,
}: SaasInvestorReportProps) {
  return (
    <InvestorReport
      projectName={projectName}
      modelType="saas"
      data={data}
    >
      <div data-pdf-page>
        <ArrGrowthSummary data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <SaasEfficiencyMetrics data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <RetentionTable data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <PipelineSummary data={data} />
      </div>
    </InvestorReport>
  );
}

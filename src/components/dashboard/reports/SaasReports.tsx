"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { AdvancedTable } from "@/components/ui/advanced-table";
import { getBenchmarkLabel } from "@/lib/benchmarks";
import type { RunResult } from "@/lib/api";

interface ReportsProps {
  results: RunResult;
  onExport: () => void;
}

const fmtMoney = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "\u2014" : formatCurrency(n);
};

const fmtPct = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "\u2014" : `${n.toFixed(1)}%`;
};

const fmtNum = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "\u2014" : n.toFixed(0);
};

const fmtRatio = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "\u2014" : n.toFixed(2);
};

function BenchmarkFootnote({ metricKey }: { metricKey: string }) {
  const label = getBenchmarkLabel(metricKey);
  if (!label) return null;
  return <p className="text-[10px] text-[#8181A5] mt-1">Industry benchmark: {label}</p>;
}

export function SaasReports({ results, onExport }: ReportsProps) {
  const data = results.dataframe;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Financial Reports</h2>
        <button onClick={onExport} className="text-sm px-3 py-1.5 border rounded-md hover:bg-muted">
          Export CSV
        </button>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">P&L</TabsTrigger>
          <TabsTrigger value="mrr">MRR Breakdown</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="saas">SaaS Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Phase", label: "Phase", format: fmtNum },
              { key: "Gross Revenue", label: "Revenue", format: fmtMoney },
              { key: "COGS", label: "COGS", format: fmtMoney },
              { key: "Total Expenses", label: "Expenses", format: fmtMoney },
              { key: "EBITDA", label: "EBITDA", format: fmtMoney },
              { key: "Net Profit", label: "Net Profit", format: fmtMoney },
            ]}
            pinnedColumns={["Month", "Phase"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="mrr">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "New MRR", label: "New MRR", format: fmtMoney },
              { key: "Expansion MRR", label: "Expansion", format: fmtMoney },
              { key: "Contraction MRR", label: "Contraction", format: fmtMoney },
              { key: "Churned MRR", label: "Churned", format: fmtMoney },
              { key: "Net New MRR", label: "Net New", format: fmtMoney },
              { key: "Total MRR", label: "Total MRR", format: fmtMoney },
              { key: "ARR", label: "ARR", format: fmtMoney },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="pipeline">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Total Leads", label: "Leads", format: fmtNum },
              { key: "Demos", label: "Demos", format: fmtNum },
              { key: "New Deals", label: "Deals", format: fmtNum },
              { key: "CAC", label: "CAC", format: fmtMoney },
              { key: "Organic %", label: "Organic %", format: fmtPct },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="saas">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "NRR %", label: "NRR %", format: fmtPct },
              { key: "GRR %", label: "GRR %", format: fmtPct },
              { key: "Quick Ratio", label: "Quick Ratio", format: fmtRatio },
              { key: "Rule of 40", label: "Rule of 40", format: fmtPct },
              { key: "Magic Number", label: "Magic Number", format: fmtRatio },
              { key: "LTV/CAC", label: "LTV/CAC", format: (v) => `${Number(v ?? 0).toFixed(2)}x` },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
          <div className="mt-2 space-y-0.5">
            <BenchmarkFootnote metricKey="NRR %" />
            <BenchmarkFootnote metricKey="GRR %" />
            <BenchmarkFootnote metricKey="Rule of 40" />
            <BenchmarkFootnote metricKey="Quick Ratio" />
            <BenchmarkFootnote metricKey="LTV/CAC" />
            <BenchmarkFootnote metricKey="Magic Number" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

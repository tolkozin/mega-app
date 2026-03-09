"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { AdvancedTable } from "@/components/ui/advanced-table";
import { getBenchmarkLabel, benchmarks } from "@/lib/benchmarks";
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
  return isNaN(n) ? "\u2014" : `${(n * 100).toFixed(1)}%`;
};

const fmtNum = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "\u2014" : n.toFixed(0);
};

const fmtMonth = (v: unknown) => {
  const n = Number(v);
  if (isNaN(n)) return "\u2014";
  const yr = Math.ceil(n / 12);
  const mo = ((n - 1) % 12) + 1;
  return `M${n} (Y${yr}·${mo.toString().padStart(2, "0")})`;
};

function BenchmarkLegend({ metrics }: { metrics: string[] }) {
  const items = metrics
    .map((key) => {
      const b = benchmarks[key];
      if (!b) return null;
      const label = getBenchmarkLabel(key);
      if (!label) return null;
      return { key, label, b };
    })
    .filter(Boolean) as { key: string; label: string; b: typeof benchmarks[string] }[];

  if (!items.length) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-[#F8F8FC] border border-[#ECECF2] space-y-1.5">
      <p className="text-[11px] font-semibold text-[#1C1D21] mb-1">Benchmark Color Guide</p>
      {items.map(({ key, b }) => (
        <div key={key} className="flex items-center gap-2 text-[10px] text-[#8181A5]">
          <span className="font-medium text-[#1C1D21] min-w-[80px]">{key}</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
            {b.direction === "higher_better" ? `>${b.good}` : `<${b.good}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EAB308] inline-block" />
            {b.direction === "higher_better" ? `>${b.warning}` : `<${b.warning}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block" />
            {b.direction === "higher_better" ? `<${b.warning}` : `>${b.warning}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SubscriptionReports({ results, onExport }: ReportsProps) {
  const data = results.dataframe;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Financial Reports</h2>
        <button
          onClick={onExport}
          className="text-sm px-3 py-1.5 border rounded-md hover:bg-muted"
        >
          Export CSV
        </button>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">P&L</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Total Gross Revenue", label: "Gross Revenue", format: fmtMoney },
              { key: "Net Revenue", label: "Net Revenue", format: fmtMoney },
              { key: "COGS", label: "COGS", format: fmtMoney },
              { key: "EBITDA", label: "EBITDA", format: fmtMoney },
              { key: "Net Profit", label: "Net Profit", format: fmtMoney },
            ]}
            pinnedColumns={["Month", "Product Phase"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "MRR Weekly", label: "MRR Weekly", format: fmtMoney },
              { key: "MRR Monthly", label: "MRR Monthly", format: fmtMoney },
              { key: "MRR Annual", label: "MRR Annual", format: fmtMoney },
              { key: "Total MRR", label: "Total MRR", format: fmtMoney },
              { key: "Gross Revenue Store", label: "Store Revenue", format: fmtMoney },
              { key: "Gross Revenue Web", label: "Web Revenue", format: fmtMoney },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="costs">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Ad Budget", label: "Ad Spend", format: fmtMoney },
              { key: "Organic Spend", label: "Organic Spend", format: fmtMoney },
              { key: "Salaries", label: "Salaries", format: fmtMoney },
              { key: "Misc Costs", label: "Misc Costs", format: fmtMoney },
              { key: "COGS", label: "COGS", format: fmtMoney },
              { key: "Total Expenses", label: "Total Expenses", format: fmtMoney },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Total Active Users", label: "Active Users", format: fmtNum },
              { key: "Blended CAC", label: "CAC", format: fmtMoney },
              { key: "LTV", label: "LTV", format: fmtMoney },
              { key: "LTV/CAC", label: "LTV/CAC", format: (v) => `${Number(v ?? 0).toFixed(2)}x` },
              { key: "ARPU", label: "ARPU", format: fmtMoney },
              { key: "Gross Margin %", label: "Gross Margin", format: fmtPct },
              { key: "Cumulative ROAS", label: "ROAS", format: (v) => `${Number(v ?? 0).toFixed(1)}x` },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
          <BenchmarkLegend metrics={["LTV/CAC", "Gross Margin %", "Cumulative ROAS"]} />
        </TabsContent>

        <TabsContent value="summary">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Cash Balance", label: "Cash Balance", format: fmtMoney },
              { key: "Cumulative Net Profit", label: "Cum. Profit", format: fmtMoney },
              { key: "ROI %", label: "ROI", format: (v) => `${Number(v ?? 0).toFixed(0)}%` },
              { key: "Burn Rate", label: "Burn Rate", format: fmtMoney },
              { key: "Runway (Months)", label: "Runway", format: (v) => v ? `${Number(v).toFixed(0)} mo` : "\u221e" },
            ]}
            pinnedColumns={["Month", "Product Phase"]}
            pageSize={25}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function EcommerceReports({ results, onExport }: ReportsProps) {
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
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Gross Revenue", label: "Gross Revenue", format: fmtMoney },
              { key: "Net Revenue", label: "Net Revenue", format: fmtMoney },
              { key: "COGS", label: "COGS", format: fmtMoney },
              { key: "EBITDA", label: "EBITDA", format: fmtMoney },
              { key: "Net Profit", label: "Net Profit", format: fmtMoney },
            ]}
            pinnedColumns={["Month", "Product Phase"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="cashflow">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Cash Balance", label: "Cash Balance", format: fmtMoney },
              { key: "Cumulative Net Profit", label: "Cum. Profit", format: fmtMoney },
              { key: "Burn Rate", label: "Burn Rate", format: fmtMoney },
              { key: "Runway (Months)", label: "Runway", format: (v) => v ? `${Number(v).toFixed(0)} mo` : "\u221e" },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <AdvancedTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtMonth },
              { key: "Total Orders", label: "Orders", format: fmtNum },
              { key: "CAC", label: "CAC", format: fmtMoney },
              { key: "LTV", label: "LTV", format: fmtMoney },
              { key: "LTV/CAC", label: "LTV/CAC", format: (v) => `${Number(v ?? 0).toFixed(2)}x` },
              { key: "ROAS", label: "ROAS", format: (v) => `${Number(v ?? 0).toFixed(1)}x` },
              { key: "Gross Margin %", label: "Gross Margin", format: (v) => `${Number(v ?? 0).toFixed(1)}%` },
            ]}
            pinnedColumns={["Month"]}
            pageSize={25}
          />
          <BenchmarkLegend metrics={["LTV/CAC", "ROAS", "Gross Margin %"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

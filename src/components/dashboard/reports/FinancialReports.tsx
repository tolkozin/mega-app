"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import type { RunResult } from "@/lib/api";

interface ReportsProps {
  results: RunResult;
  onExport: () => void;
}

function DataTable({ data, columns }: {
  data: Record<string, unknown>[];
  columns: { key: string; label: string; format?: (v: unknown) => string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col.key} className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.key} className="p-2 whitespace-nowrap">
                  {col.format ? col.format(row[col.key]) : String(row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const fmtMoney = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "—" : formatCurrency(n);
};

const fmtPct = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`;
};

const fmtNum = (v: unknown) => {
  const n = Number(v);
  return isNaN(n) ? "—" : n.toFixed(0);
};

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
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Total Gross Revenue", label: "Gross Revenue", format: fmtMoney },
              { key: "Net Revenue", label: "Net Revenue", format: fmtMoney },
              { key: "Total COGS", label: "COGS", format: fmtMoney },
              { key: "Total OpEx", label: "OpEx", format: fmtMoney },
              { key: "EBITDA", label: "EBITDA", format: fmtMoney },
              { key: "Net Profit", label: "Net Profit", format: fmtMoney },
              { key: "Net Margin %", label: "Net Margin", format: fmtPct },
            ]}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "MRR Weekly", label: "MRR Weekly", format: fmtMoney },
              { key: "MRR Monthly", label: "MRR Monthly", format: fmtMoney },
              { key: "MRR Annual", label: "MRR Annual", format: fmtMoney },
              { key: "Total MRR", label: "Total MRR", format: fmtMoney },
              { key: "Gross Revenue Store", label: "Store Revenue", format: fmtMoney },
              { key: "Gross Revenue Web", label: "Web Revenue", format: fmtMoney },
            ]}
          />
        </TabsContent>

        <TabsContent value="costs">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Ad Spend", label: "Ad Spend", format: fmtMoney },
              { key: "Organic Spend", label: "Organic Spend", format: fmtMoney },
              { key: "Salaries", label: "Salaries", format: fmtMoney },
              { key: "Misc", label: "Misc Costs", format: fmtMoney },
              { key: "Total COGS", label: "COGS", format: fmtMoney },
              { key: "Total OpEx", label: "Total OpEx", format: fmtMoney },
            ]}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Active Users", label: "Active Users", format: fmtNum },
              { key: "CAC", label: "CAC", format: fmtMoney },
              { key: "LTV", label: "LTV", format: fmtMoney },
              { key: "LTV/CAC", label: "LTV/CAC", format: (v) => `${Number(v ?? 0).toFixed(2)}x` },
              { key: "ARPU", label: "ARPU", format: fmtMoney },
              { key: "Gross Margin %", label: "Gross Margin", format: fmtPct },
              { key: "Cumulative ROAS", label: "ROAS", format: (v) => `${Number(v ?? 0).toFixed(1)}x` },
            ]}
          />
        </TabsContent>

        <TabsContent value="summary">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Cash Balance", label: "Cash Balance", format: fmtMoney },
              { key: "Cumulative Profit", label: "Cumulative Profit", format: fmtMoney },
              { key: "ROI %", label: "ROI", format: (v) => `${Number(v ?? 0).toFixed(0)}%` },
              { key: "Burn Rate", label: "Burn Rate", format: fmtMoney },
              { key: "Runway (Months)", label: "Runway", format: (v) => v ? `${Number(v).toFixed(0)} mo` : "∞" },
            ]}
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
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Product Phase", label: "Phase", format: fmtNum },
              { key: "Gross Revenue", label: "Gross Revenue", format: fmtMoney },
              { key: "Net Revenue", label: "Net Revenue", format: fmtMoney },
              { key: "COGS", label: "COGS", format: fmtMoney },
              { key: "Total OpEx", label: "OpEx", format: fmtMoney },
              { key: "Net Profit", label: "Net Profit", format: fmtMoney },
            ]}
          />
        </TabsContent>

        <TabsContent value="cashflow">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Cash Balance", label: "Cash Balance", format: fmtMoney },
              { key: "Cumulative Profit", label: "Cum. Profit", format: fmtMoney },
              { key: "Burn Rate", label: "Burn Rate", format: fmtMoney },
              { key: "Runway (Months)", label: "Runway", format: (v) => v ? `${Number(v).toFixed(0)} mo` : "∞" },
            ]}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <DataTable
            data={data}
            columns={[
              { key: "Month", label: "Month", format: fmtNum },
              { key: "Total Orders", label: "Orders", format: fmtNum },
              { key: "CAC", label: "CAC", format: fmtMoney },
              { key: "LTV", label: "LTV", format: fmtMoney },
              { key: "LTV/CAC", label: "LTV/CAC", format: (v) => `${Number(v ?? 0).toFixed(2)}x` },
              { key: "ROAS", label: "ROAS", format: (v) => `${Number(v ?? 0).toFixed(1)}x` },
              { key: "Gross Margin %", label: "Gross Margin", format: fmtPct },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

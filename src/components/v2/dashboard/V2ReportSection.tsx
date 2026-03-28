"use client";

/**
 * v2 Report Section — Styled wrapper for Financial Report tables.
 *
 * Wraps existing AdvancedTable with v2 card styling, rounded corners,
 * and animated section headers. The actual table rendering uses the
 * existing @tanstack/react-table AdvancedTable component.
 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdvancedTable, type AdvancedTableColumn } from "@/components/ui/advanced-table";
import { V2_CARD_CLASS } from "@/components/v2/charts/tokens";

/* ─── Types ─── */

interface TabDef {
  value: string;
  label: string;
  columns: AdvancedTableColumn[];
  pinnedColumns?: string[];
  footer?: React.ReactNode;
}

interface V2ReportSectionProps {
  title?: string;
  description?: string;
  data: Record<string, unknown>[];
  tabs: TabDef[];
  defaultTab?: string;
  pageSize?: number;
}

/* ─── Component ─── */

export function V2ReportSection({
  title = "Financial Reports",
  description,
  data,
  tabs,
  defaultTab,
  pageSize = 25,
}: V2ReportSectionProps) {
  return (
    <div className={`${V2_CARD_CLASS} p-5 md:p-6`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[15px] font-extrabold text-[#1a1a2e] leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[12px] text-[#9ca3af] mt-1 font-medium">{description}</p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab ?? tabs[0]?.value}>
        <TabsList className="mb-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
              <AdvancedTable
                data={data}
                columns={tab.columns}
                pinnedColumns={tab.pinnedColumns}
                pageSize={pageSize}
              />
            </div>
            {tab.footer}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

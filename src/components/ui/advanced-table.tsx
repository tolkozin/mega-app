"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnSizingState,
  type FilterFn,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdvancedTableColumn {
  key: string;
  label: string;
  format?: (v: unknown) => string;
}

export interface AdvancedTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: AdvancedTableColumn[];
  pinnedColumns?: string[];
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs — no extra dep)
// ---------------------------------------------------------------------------

function IconChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 7L5 3L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 3L5 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFilter({ active, className }: { active?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 2.5h10M3 6h6M5 9.5h2"
        stroke={active ? "#2163E7" : "currentColor"}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronsUpDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4L5 1L8 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 6L5 9L8 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Filter function (case-insensitive substring)
// ---------------------------------------------------------------------------

const includesString: FilterFn<Record<string, unknown>> = (row, columnId, filterValue: string) => {
  const cellValue = row.getValue(columnId);
  const stringValue = cellValue == null ? "" : String(cellValue);
  return stringValue.toLowerCase().includes(filterValue.toLowerCase());
};
includesString.autoRemove = (val: unknown) => !val;

// ---------------------------------------------------------------------------
// Column resizer handle
// ---------------------------------------------------------------------------

function ResizerHandle({
  onMouseDown,
  isResizing,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute right-0 top-0 h-full w-[5px] cursor-col-resize select-none touch-none",
        "flex items-center justify-center group/resizer"
      )}
    >
      <div
        className={cn(
          "w-[1px] h-4 rounded-full transition-colors",
          isResizing ? "bg-[#2163E7]" : "bg-[#ECECF2] group-hover/resizer:bg-[#2163E7]"
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AdvancedTable<T extends Record<string, unknown>>({
  data,
  columns: columnDefs,
  pinnedColumns = [],
  pageSize: initialPageSize = 25,
}: AdvancedTableProps<T>) {
  // ---- state ----
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning] = useState<ColumnPinningState>({
    left: pinnedColumns,
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize === -1 ? 999999 : initialPageSize,
  });

  // Which filter inputs are visible (by column id)
  const [visibleFilters, setVisibleFilters] = useState<Record<string, boolean>>({});

  // Track column resizing
  const resizingRef = useRef<{
    colId: string;
    startX: number;
    startSize: number;
  } | null>(null);

  // ---- build tanstack columns ----
  const columnHelper = createColumnHelper<Record<string, unknown>>();

  const tableColumns: ColumnDef<Record<string, unknown>, unknown>[] = columnDefs.map((col) =>
    columnHelper.accessor(col.key, {
      id: col.key,
      header: col.label,
      filterFn: includesString,
      cell: (info) => {
        const raw = info.getValue();
        return col.format ? col.format(raw) : raw == null ? "—" : String(raw);
      },
      size: columnSizing[col.key] ?? 140,
      minSize: 60,
    })
  );

  // ---- table instance ----
  const table = useReactTable({
    data: data as Record<string, unknown>[],
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnPinning,
      columnSizing,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    manualPagination: false,
  });

  // ---- derived ----
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = pageSize >= 999999 ? 1 : pageIndex * pageSize + 1;
  const endRow = pageSize >= 999999 ? totalRows : Math.min((pageIndex + 1) * pageSize, totalRows);

  // ---- column resize mouse handlers ----
  const startResize = useCallback(
    (e: React.MouseEvent, colId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const currentSize =
        columnSizing[colId] ??
        (tableColumns.find((c) => c.id === colId) as { size?: number } | undefined)?.size ??
        140;
      resizingRef.current = { colId, startX: e.clientX, startSize: currentSize };

      function onMouseMove(ev: MouseEvent) {
        if (!resizingRef.current) return;
        const delta = ev.clientX - resizingRef.current.startX;
        const newSize = Math.max(60, resizingRef.current.startSize + delta);
        setColumnSizing((prev) => ({ ...prev, [resizingRef.current!.colId]: newSize }));
      }
      function onMouseUp() {
        resizingRef.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [columnSizing, tableColumns]
  );

  // Reset page when filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  // ---- helpers ----
  const toggleFilter = (colId: string) => {
    setVisibleFilters((prev) => {
      const next = { ...prev, [colId]: !prev[colId] };
      // Clear filter value when hiding
      if (!next[colId]) {
        setColumnFilters((f) => f.filter((cf) => cf.id !== colId));
      }
      return next;
    });
  };

  // Compute sticky left offsets for pinned columns
  const pinnedLeftOffsets: Record<string, number> = {};
  let leftAccumulator = 0;
  for (const colId of pinnedColumns) {
    pinnedLeftOffsets[colId] = leftAccumulator;
    leftAccumulator += columnSizing[colId] ?? 140;
  }

  const pageSizeOptions = [
    { label: "25 rows", value: 25 },
    { label: "50 rows", value: 50 },
    { label: "100 rows", value: 100 },
    { label: "All", value: -1 },
  ];

  // ---- render ----
  return (
    <div className="flex flex-col gap-0 w-full rounded-xl border border-[#eef0f6] overflow-hidden">
      {/* Table scroll container */}
      <div className="overflow-x-auto overflow-y-auto">
        <table
          className="border-collapse text-[11px] text-[#1a1a2e] font-lato"
          style={{ width: table.getTotalSize(), minWidth: "100%" }}
        >
          {/* THEAD */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                {/* Header row */}
                <tr className="bg-[#f8f9fc] border-b border-[#eef0f6]">
                  {headerGroup.headers.map((header) => {
                    const colId = header.column.id;
                    const isPinned = pinnedColumns.includes(colId);
                    const sortDir = header.column.getIsSorted();
                    const isFilterVisible = visibleFilters[colId];
                    const isFiltered = header.column.getIsFiltered();
                    const isResizing = resizingRef.current?.colId === colId;

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "relative text-left font-bold text-[10px] uppercase tracking-[0.06em] text-[#9ca3af] whitespace-nowrap select-none",
                          "border-r border-[#eef0f6] last:border-r-0",
                          isPinned && "z-10 bg-[#f8f9fc]"
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: header.column.columnDef.minSize,
                          ...(isPinned
                            ? { position: "sticky", left: pinnedLeftOffsets[colId] ?? 0 }
                            : {}),
                        }}
                      >
                        {/* Header label + sort + filter controls */}
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-2 cursor-pointer group/header",
                            "hover:text-[#6b7280] transition-colors"
                          )}
                          onClick={() => header.column.toggleSorting()}
                        >
                          <span className="flex-1 truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>

                          {/* Sort indicator */}
                          <span className="shrink-0 text-[#9ca3af] group-hover/header:text-[#1a1a2e]">
                            {sortDir === "asc" ? (
                              <IconChevronUp />
                            ) : sortDir === "desc" ? (
                              <IconChevronDown />
                            ) : (
                              <IconChevronsUpDown className="opacity-40 group-hover/header:opacity-70" />
                            )}
                          </span>

                          {/* Filter toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFilter(colId);
                            }}
                            className={cn(
                              "shrink-0 p-0.5 rounded transition-colors",
                              isFilterVisible || isFiltered
                                ? "text-[#2163E7]"
                                : "text-[#9ca3af] opacity-0 group-hover/header:opacity-100"
                            )}
                            title={isFilterVisible ? "Hide filter" : "Show filter"}
                          >
                            <IconFilter active={isFiltered} />
                          </button>
                        </div>

                        {/* Resizer */}
                        <ResizerHandle
                          onMouseDown={(e) => startResize(e, colId)}
                          isResizing={isResizing}
                        />
                      </th>
                    );
                  })}
                </tr>

                {/* Filter row — only rendered when any filter is visible */}
                {headerGroup.headers.some((h) => visibleFilters[h.column.id]) && (
                  <tr className="bg-white border-b border-[#eef0f6]">
                    {headerGroup.headers.map((header) => {
                      const colId = header.column.id;
                      const isPinned = pinnedColumns.includes(colId);
                      const isVisible = visibleFilters[colId];

                      return (
                        <td
                          key={header.id}
                          className={cn(
                            "border-r border-[#eef0f6] last:border-r-0 px-2 py-1.5",
                            isPinned && "z-10 bg-white"
                          )}
                          style={{
                            width: header.getSize(),
                            ...(isPinned
                              ? { position: "sticky", left: pinnedLeftOffsets[colId] ?? 0 }
                              : {}),
                          }}
                        >
                          {isVisible && (
                            <input
                              type="text"
                              value={(header.column.getFilterValue() as string) ?? ""}
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                              placeholder="Filter…"
                              className={cn(
                                "w-full rounded border border-[#eef0f6] bg-[#f8f9fc] px-2 py-1",
                                "text-xs text-[#1a1a2e] placeholder:text-[#9ca3af]",
                                "focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7]/30",
                                "transition-colors"
                              )}
                              // eslint-disable-next-line jsx-a11y/no-autofocus
                              autoFocus
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </thead>

          {/* TBODY */}
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnDefs.length}
                  className="text-center py-12 text-sm text-[#9ca3af]"
                >
                  No rows match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-[#eef0f6] last:border-b-0",
                    "hover:bg-[#EBF1FD] transition-colors",
                    rowIndex % 2 === 1 && "bg-[#fafbfd]"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const colId = cell.column.id;
                    const isPinned = pinnedColumns.includes(colId);

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-2.5 py-1.5 whitespace-nowrap tabular-nums border-r border-[#eef0f6] last:border-r-0",
                          isPinned && "z-10",
                          isPinned && (rowIndex % 2 === 1 ? "bg-[#fafbfd]" : "bg-white"),
                          isPinned && "hover:bg-[#EBF1FD]"
                        )}
                        style={
                          isPinned
                            ? { position: "sticky", left: pinnedLeftOffsets[colId] ?? 0 }
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-3 py-2",
          "border-t border-[#eef0f6] bg-[#eef0f6]",
          "text-sm text-[#9ca3af]"
        )}
      >
        {/* Row count info */}
        <span className="text-xs">
          {totalRows === 0
            ? "No rows"
            : pageSize >= 999999
            ? `${totalRows} rows`
            : `${startRow}–${endRow} of ${totalRows} rows`}
        </span>

        {/* Page size + navigation */}
        <div className="flex items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Show</span>
            <select
              value={pageSize >= 999999 ? -1 : pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPagination({
                  pageIndex: 0,
                  pageSize: val === -1 ? 999999 : val,
                });
              }}
              className={cn(
                "rounded border border-[#eef0f6] bg-white px-2 py-1 text-xs text-[#1a1a2e]",
                "focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7]/30",
                "cursor-pointer"
              )}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page navigation — hidden when showing all */}
          {pageSize < 999999 && pageCount > 1 && (
            <div className="flex items-center gap-1">
              <PaginationButton
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="First page"
              >
                «
              </PaginationButton>
              <PaginationButton
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Previous page"
              >
                ‹
              </PaginationButton>

              {/* Page number pills */}
              {buildPageNumbers(pageIndex, pageCount).map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#9ca3af]">
                    …
                  </span>
                ) : (
                  <PaginationButton
                    key={item}
                    onClick={() => table.setPageIndex(item as number)}
                    active={(item as number) === pageIndex}
                  >
                    {(item as number) + 1}
                  </PaginationButton>
                )
              )}

              <PaginationButton
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Next page"
              >
                ›
              </PaginationButton>
              <PaginationButton
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                title="Last page"
              >
                »
              </PaginationButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination helpers
// ---------------------------------------------------------------------------

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "min-w-[26px] h-[26px] px-1.5 rounded text-xs font-medium transition-colors",
        "focus:outline-none focus:ring-1 focus:ring-[#2163E7]/40",
        active
          ? "bg-[#2163E7] text-white"
          : "bg-white border border-[#eef0f6] text-[#1a1a2e] hover:border-[#2163E7] hover:text-[#2163E7]",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}

/** Returns page indices (0-based) with "…" placeholders for large page counts. */
function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages: (number | "…")[] = [];
  // Always show first page
  pages.push(0);

  const windowStart = Math.max(1, current - 1);
  const windowEnd = Math.min(total - 2, current + 1);

  if (windowStart > 1) pages.push("…");
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < total - 2) pages.push("…");

  // Always show last page
  pages.push(total - 1);
  return pages;
}

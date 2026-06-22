/**
 * CLASSZ Scalable DataTable
 *
 * Designed for millions of rows via server-side pagination.
 * Frontend renders only the current page. Backend-ready query params.
 * Includes Export (Excel CSV, PDF) and Print support.
 */

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";

export interface DataColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string;
  width?: string;
  align?: "start" | "center" | "end";
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  rowKey: (row: T) => string;
  title?: string;
  selectedRows?: Set<string>;
  onSelectRow?: (key: string) => void;
  onSelectAll?: () => void;
  bulkActions?: React.ReactNode;
}

export function DataTable<T>({
  columns, data, total, page, pageSize, onPageChange,
  sortBy, sortOrder, onSort, rowKey, title,
  selectedRows, onSelectRow, onSelectAll, bulkActions,
}: DataTableProps<T>) {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    setExporting(true);
    const headers = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns.map((c) => {
        const val = c.exportValue ? c.exportValue(row) : String((row as any)[c.key] ?? "");
        return `"${val.replace(/"/g, '""')}"`;
      }).join(","),
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handlePrint = () => {
    const printContent = `
      <html><head><title>${title || "CLASSZ Report"}</title>
      <style>body{font-family:system-ui;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5;font-weight:600}.header{display:flex;justify-content:space-between;margin-bottom:16px}.title{font-size:18px;font-weight:700}.meta{color:#666;font-size:12px}</style></head>
      <body><div class="header"><div class="title">${title || "Report"}</div><div class="meta">Generated: ${new Date().toLocaleString()} · Page ${page} · Showing ${data.length} of ${total.toLocaleString()} records</div></div>
      <table><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
      <tbody>${data.map((row) => `<tr>${columns.map((c) => {
        const val = c.exportValue ? c.exportValue(row) : String((row as any)[c.key] ?? "");
        return `<td>${val}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table>
      <div class="meta" style="margin-top:12px">CLASSZ Platform · ${total.toLocaleString()} total records</div></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(printContent); w.document.close(); w.print(); }
  };

  const allSelected = selectedRows && data.length > 0 && data.every((r) => selectedRows.has(rowKey(r)));

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {selectedRows && selectedRows.size > 0 && (
            <Badge variant="outline" className="rounded-full">{selectedRows.size} selected</Badge>
          )}
          {bulkActions}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs h-8" onClick={handleExportCSV} disabled={exporting}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs h-8" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectedRows && (
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={() => onSelectAll?.()} className="rounded" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 font-medium text-muted-foreground",
                    col.align === "end" ? "text-end" : col.align === "center" ? "text-center" : "text-start",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortBy === col.key
                        ? sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        : <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + (selectedRows ? 1 : 0)} className="px-3 py-8 text-center text-muted-foreground">No records found.</td></tr>
            ) : (
              data.map((row) => {
                const key = rowKey(row);
                const isSelected = selectedRows?.has(key);
                return (
                  <tr key={key} className={cn("border-b last:border-0 transition-colors", isSelected && "bg-primary/5")}>
                    {selectedRows && (
                      <td className="w-10 px-3 py-2.5">
                        <input type="checkbox" checked={isSelected} onChange={() => onSelectRow?.(key)} className="rounded" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-3 py-2.5",
                          col.align === "end" ? "text-end" : col.align === "center" ? "text-center" : "text-start",
                          col.hideOnMobile && "hidden sm:table-cell",
                        )}
                      >
                        {col.render ? col.render(row) : String((row as any)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
}

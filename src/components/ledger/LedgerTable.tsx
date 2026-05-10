import React from "react";
import { Card } from "../shared/Card";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LedgerTableProps {
  columns: { key: string; label: string; color?: string; minWidth?: number }[];
  rows: { id: string; mainLabel: string; rowSpan: number }[];
  subRowItems: any[];
  renderCell: (rowId: string, item: any, colKey: string) => React.ReactNode;
  renderSideHeader: (item: any) => React.ReactNode;
}

export function LedgerTable({
  columns,
  rows,
  subRowItems,
  renderCell,
  renderSideHeader,
}: LedgerTableProps) {
  return (
    <Card className="p-0 overflow-hidden border-slate-200 mb-6">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full border-collapse text-xs md:text-sm table-fixed">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="sticky-col w-12 p-2 text-center font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 bg-slate-50">
                <span className="[writing-mode:vertical-lr] rotate-180 inline-block text-[10px]">Date</span>
              </th>
              <th className="sticky-col-2 w-20 p-3 text-left font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 bg-slate-50">
                Item
              </th>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className="p-3 text-center border-r border-slate-100 last:border-r-0"
                  style={{ minWidth: col.minWidth || 140 }}
                >
                  <span className="font-bold" style={{ color: col.color || "#0f172a" }}>
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <React.Fragment key={row.id}>
                {subRowItems.map((item, itemIdx) => (
                  <tr 
                    key={`${row.id}-${itemIdx}`} 
                    className={cn(
                      "group border-b border-slate-100 last:border-b-0",
                      itemIdx === subRowItems.length - 1 && "border-b-slate-200 border-b-2"
                    )}
                  >
                    {itemIdx === 0 && (
                      <td 
                        className="sticky-col p-0 font-bold text-slate-900 align-middle border-r border-slate-100 bg-white" 
                        rowSpan={row.rowSpan}
                      >
                        <div className="flex items-center justify-center h-full min-h-[60px] py-4">
                          <span className="[writing-mode:vertical-lr] rotate-180 inline-block whitespace-nowrap text-[11px] tracking-tighter">
                            {row.mainLabel}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="sticky-col-2 p-3 font-bold text-slate-400 uppercase tracking-tight border-r border-slate-100 bg-slate-50/30 text-[9px] md:text-[10px]">
                      {renderSideHeader(item)}
                    </td>
                    {columns.map(col => (
                      <React.Fragment key={col.key}>
                        {renderCell(row.id, item, col.key)}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

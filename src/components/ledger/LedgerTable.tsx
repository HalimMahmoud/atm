import React from "react";
import { Card } from "../shared/Card";

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
    <Card style={{ padding: 0, overflowX: "auto", border: "0.5px solid var(--color-border-secondary)", marginBottom: 24 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
        <thead>
          <tr style={{ background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-secondary)" }}>
            <th className="sticky-col" style={{ padding: "12px 15px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)", width: 90, borderRight: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>Date</th>
            <th className="sticky-col-2" style={{ padding: "12px 10px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)", width: 60, borderRight: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>Item</th>
            {columns.map(col => (
              <th key={col.key} style={{ padding: "12px 10px", textAlign: "center", minWidth: col.minWidth || 140, borderRight: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              {subRowItems.map((item, itemIdx) => (
                <tr key={`${row.id}-${itemIdx}`} style={{ borderBottom: itemIdx === subRowItems.length - 1 ? "2px solid var(--color-border-secondary)" : "0.5px solid var(--color-border-tertiary)" }}>
                  {itemIdx === 0 && (
                    <td className="sticky-col" rowSpan={row.rowSpan} style={{ padding: "15px", fontWeight: 700, verticalAlign: "top", borderRight: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                      {row.mainLabel}
                    </td>
                  )}
                  <td className="sticky-col-2" style={{ padding: "10px", fontWeight: 600, color: "var(--color-text-secondary)", borderRight: "1px solid var(--color-border-tertiary)", background: "var(--color-background-tertiary)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.02em" }}>
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
    </Card>
  );
}

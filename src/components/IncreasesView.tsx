import React from "react";
import type { AppState, Action, IncreaseEntry, Denomination } from "../types";
import { ATM_COLORS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Badge } from "./shared/Badge";
import { CounterInput } from "./shared/CounterInput";
import { LedgerTable } from "./ledger/LedgerTable";

export function IncreasesView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const { base, dailyIncreases, selectedDate, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  const dayData = dailyIncreases[selectedDate] || {};

  const grandTotal = ATM_IDS.reduce((s, id) => s + calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }) + (dayData[id] || []).reduce((a, inc) => a + calcTotal(inc), 0), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>Operation Date:</label>
          <input type="date" value={selectedDate} onChange={(e) => dispatch({ type: "SET_DATE", date: e.target.value })} style={{ padding: "5px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }} />
        </div>
        <div style={{ marginLeft: "auto", background: "#E6F1FB", color: "#185FA5", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>Operation Grand Total: EGP {fmt(grandTotal)}</div>
      </div>

      <LedgerTable 
        columns={ATM_IDS.map(id => ({ key: id, label: id, color: ATM_COLORS[id] }))}
        rows={[{ id: selectedDate, mainLabel: new Date(selectedDate).toLocaleDateString(undefined, { day: "2-digit", month: "short" }), rowSpan: 8 }]}
        subRowItems={["Base", 200, 100, 50, 10, "Total Increase", "Note", "Day Total"]}
        renderSideHeader={(item) => (
           item === "Base" ? "Opening Base" : 
           item === "Total Increase" ? "Total Increases" : 
           item === "Day Total" ? "Net Machine Custody" : 
           item === "Note" ? "Operation Note" : 
           typeof item === "number" ? `× ${item} EGP` : item
        )}
        renderCell={(_, item, atmId) => {
          const incs = dayData[atmId] || [];
          const f = incs[0] || { id: 0, 200: 0, 100: 0, 50: 0, 10: 0, note: "" };
          const b = base[atmId] || { 200: 0, 100: 0, 50: 0, 10: 0 };
          
          const upd = (field: keyof IncreaseEntry, val: any) => {
            if (f.id === 0) {
              dispatch({ type: "ADD_INCREASE", date: selectedDate, atmId, entry: { id: Date.now(), 200: 0, 100: 0, 50: 0, 10: 0, note: "", [field]: val } });
            } else {
              dispatch({ type: "UPDATE_INCREASE", date: selectedDate, atmId, id: f.id, field, val });
            }
          };

          const cellStyle: React.CSSProperties = { padding: 0, borderRight: "0.5px solid var(--color-border-tertiary)", height: 38, textAlign: "center" };

          if (item === "Base") return <td style={{ ...cellStyle, background: "rgba(0,0,0,0.02)", color: "var(--color-text-tertiary)", fontSize: 11 }}>{fmt(calcTotal(b))}</td>;
          if (typeof item === "number") {
            const d = item as Denomination;
            return <td style={cellStyle}><CounterInput variant="cell" value={Number(f[d]) || 0} onChange={(v) => upd(d as any, v)} /></td>;
          }
          if (item === "Total Increase") {
            const incOnly = incs.reduce((s, inc) => s + calcTotal(inc), 0);
            return <td style={{ ...cellStyle, background: "rgba(59, 109, 17, 0.04)", fontWeight: 600, color: "#3B6D11", fontSize: 11 }}>{incOnly > 0 ? `+${fmt(incOnly)}` : "-"}</td>;
          }
          if (item === "Note") return <td style={cellStyle}><input value={f.note || ""} onChange={e => upd("note", e.target.value)} style={{ width: "100%", height: "100%", border: "none", background: "transparent", textAlign: "center", fontSize: 12, outline: "none" }} placeholder="..." /></td>;
          
          const total = calcTotal(b) + incs.reduce((s, inc) => s + calcTotal(inc), 0);
          return <td style={{ ...cellStyle, background: "rgba(24, 95, 165, 0.05)", fontWeight: 800, color: ATM_COLORS[atmId], fontSize: 13 }}>{fmt(total)}</td>;
        }}
      />
      
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>
        <Badge color="blue">Info</Badge>
        <span>This view edits the primary daily increase for each ATM. Total includes base custody.</span>
      </div>
    </div>
  );
}

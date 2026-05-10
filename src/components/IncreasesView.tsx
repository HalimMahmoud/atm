import React from "react";
import type { AppState, Action, IncreaseEntry, Denomination } from "../types";
import { ATM_COLORS } from "../types";
import { calcTotal, fmt } from "../utils";
import { CounterInput } from "./shared/CounterInput";
import { LedgerTable } from "./ledger/LedgerTable";
import { Calendar, TrendingUp, Info } from "lucide-react";

export function IncreasesView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const { base, dailyIncreases, selectedDate, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  const dayData = dailyIncreases[selectedDate] || {};

  const grandTotal = ATM_IDS.reduce((s, id) => s + calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }) + (dayData[id] || []).reduce((a, inc) => a + calcTotal(inc), 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => dispatch({ type: "SET_DATE", date: e.target.value })} 
              className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Operation Grand Total</p>
            <p className="text-lg font-bold leading-none mt-1">EGP {fmt(grandTotal)}</p>
          </div>
        </div>
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

          const cellClass = "p-0 border-r border-slate-100 last:border-r-0 h-10 text-center align-middle";

          if (item === "Base") return <td className={cellClass + " bg-slate-50/50 text-slate-400 text-[10px] font-mono"}>{fmt(calcTotal(b))}</td>;
          if (typeof item === "number") {
            const d = item as Denomination;
            return (
              <td className={cellClass}>
                <CounterInput variant="cell" value={Number(f[d]) || 0} onChange={(v) => upd(d as any, v)} />
              </td>
            );
          }
          if (item === "Total Increase") {
            const incOnly = incs.reduce((s, inc) => s + calcTotal(inc), 0);
            return (
              <td className={cellClass + " bg-green-50/30 font-bold text-green-600 text-[10px] font-mono"}>
                {incOnly > 0 ? `+${fmt(incOnly)}` : "-"}
              </td>
            );
          }
          if (item === "Note") return (
            <td className={cellClass}>
              <input 
                value={f.note || ""} 
                onChange={e => upd("note", e.target.value)} 
                className="w-full h-full bg-transparent text-center text-[10px] text-slate-500 outline-none placeholder:text-slate-300" 
                placeholder="..." 
              />
            </td>
          );
          
          const total = calcTotal(b) + incs.reduce((s, inc) => s + calcTotal(inc), 0);
          return (
            <td 
              className={cellClass + " bg-slate-100/50 font-bold text-xs font-mono"}
              style={{ color: ATM_COLORS[atmId] }}
            >
              {fmt(total)}
            </td>
          );
        }}
      />
      
      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-soft">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Info className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          This view manages the primary daily increase for each ATM. The grand total includes both base custody and added increases.
        </p>
      </div>
    </div>
  );
}

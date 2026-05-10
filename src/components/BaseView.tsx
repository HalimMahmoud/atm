import type { AppState } from "../types";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";
import { Info, Wallet } from "lucide-react";

export function BaseView({ state }: { state: AppState }) {
  const { base, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  const grandTotal = ATM_IDS.reduce((s, id) => s + calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Info className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Read-only view • Edit via Settings</span>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-soft">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">Grand Base Total</p>
            <p className="text-lg font-bold text-slate-900 leading-none mt-1">EGP {fmt(grandTotal)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ATM_IDS.map((id) => (
          <Card key={id} className="group overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ background: ATM_COLORS[id] || "#0f172a" }}
            />
            
            <div className="flex justify-between items-center mb-4">
              <span 
                className="font-bold text-sm" 
                style={{ color: ATM_COLORS[id] || "#0f172a" }}
              >
                {id}
              </span>
              <Badge color="gray">
                Total: {fmt(calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-50">
                <span>Denom</span>
                <span className="text-right">Count</span>
                <span className="text-right">Amount</span>
              </div>
              
              {DENOMINATIONS.map((d) => (
                <div key={d} className="grid grid-cols-3 text-xs items-center py-1">
                  <span className="font-medium text-slate-500">EGP {d}</span>
                  <span className="text-right font-mono text-slate-900">
                    {fmt(base[id]?.[d] || 0)}
                  </span>
                  <span className="text-right font-mono font-bold text-slate-900">
                    {fmt((base[id]?.[d] || 0) * d)}
                  </span>
                </div>
              ))}
              
              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                <span 
                  className="font-mono text-sm font-bold"
                  style={{ color: ATM_COLORS[id] || "#0f172a" }}
                >
                  EGP {fmt(calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

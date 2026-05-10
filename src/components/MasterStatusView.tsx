import type { AppState, Counts, IncreaseEntry, Denomination, AtmId } from "../types";
import { DENOMINATIONS, ATM_COLORS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";
import { Activity, ShieldCheck, Wallet, TrendingUp } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MasterStatusView({ state }: { state: AppState }) {
  const { base, dailyIncreases, holidays, selectedDate, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);

  const getDenomSum = (items: IncreaseEntry[], d: Denomination) => items.reduce((s, e) => s + (Number(e[d]) || 0), 0);
  
  const getAtmHolidayUsage = (id: AtmId) => {
    const counts = DENOMINATIONS.reduce((acc, d) => {
      acc[d] = holidays.reduce((s, h) => s + h.days.reduce((ds, dy) => ds + getDenomSum(dy.feedings[id] || [], d), 0), 0);
      return acc;
    }, { 200: 0, 100: 0, 50: 0, 10: 0 } as Counts);
    return { amount: calcTotal(counts), counts };
  };

  const pool = {
    initial: DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: holidays.reduce((s, h) => s + h.initialCounts[d], 0) }), {} as Counts),
    fed: DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: ATM_IDS.reduce((s, id) => s + getAtmHolidayUsage(id).counts[d], 0) }), {} as Counts),
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">System Overview</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Master Operation Status</h2>
        <p className="text-slate-500 text-sm font-medium">Consolidated overview of all custody and holiday pools.</p>
      </div>

      <Section title="1. Total Undebited Breakdown" icon={TrendingUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ATM_IDS.map((id) => {
            const usage = getAtmHolidayUsage(id as AtmId);
            return (
              <Card key={id} className="relative overflow-hidden pt-6">
                <div 
                  className="absolute top-0 left-0 w-1 h-full" 
                  style={{ background: ATM_COLORS[id] || "#0f172a" }}
                />
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="font-bold text-sm" style={{ color: ATM_COLORS[id] || "#0f172a" }}>{id}</span>
                  <span className="text-xs font-black text-red-600">−EGP {fmt(usage.amount)}</span>
                </div>
                <div className="space-y-1 px-2">
                  {DENOMINATIONS.map(d => (
                    <div key={d} className="flex justify-between items-center bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EGP {d}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">{usage.counts[d]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="2. Holiday Pool Management" icon={ShieldCheck}>
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Denom</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Pool</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Fed</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {DENOMINATIONS.map(d => {
                  const rem = pool.initial[d] - pool.fed[d];
                  return (
                    <tr key={d} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900">EGP {d}</td>
                      <td className="p-4 text-center">
                        <p className="font-mono font-bold text-slate-900">{pool.initial[d]}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{fmt(pool.initial[d]*d)}</p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="font-mono font-bold text-red-600">−{pool.fed[d]}</p>
                        <p className="text-[10px] text-red-400/70 font-mono mt-0.5">−{fmt(pool.fed[d]*d)}</p>
                      </td>
                      <td className="p-4 text-center">
                        <p className={cn(
                          "font-mono font-black",
                          rem < 0 ? "text-red-600" : "text-blue-600"
                        )}>
                          {rem}
                        </p>
                        <p className="text-[10px] font-mono opacity-60 mt-0.5">{fmt(rem*d)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td className="p-4 font-black uppercase tracking-widest text-[10px]">Total Position</td>
                  <td className="p-4 text-center font-mono font-black">{fmt(Object.keys(pool.initial).reduce((s, k) => s + pool.initial[Number(k) as Denomination] * Number(k), 0))}</td>
                  <td className="p-4 text-center font-mono font-black text-red-400">−{fmt(Object.keys(pool.fed).reduce((s, k) => s + pool.fed[Number(k) as Denomination] * Number(k), 0))}</td>
                  <td className="p-4 text-center font-mono font-black text-blue-400">
                    {fmt(Object.keys(pool.initial).reduce((s, k) => s + pool.initial[Number(k) as Denomination] * Number(k), 0) - Object.keys(pool.fed).reduce((s, k) => s + pool.fed[Number(k) as Denomination] * Number(k), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </Section>

      <Section title="3. Final Net Custody Position" icon={Wallet}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ATM_IDS.map((id) => {
            const hol = getAtmHolidayUsage(id as AtmId);
            return (
              <Card key={id} className="relative overflow-hidden group">
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ background: ATM_COLORS[id] || "#0f172a" }}
                />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-base" style={{ color: ATM_COLORS[id] || "#0f172a" }}>{id}</h3>
                  <Badge color="gray" className="text-[9px]">Calculated Live</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pb-2 border-b border-slate-50">
                    <span className="text-left">DNM</span>
                    <span>Base</span>
                    <span>Inc</span>
                    <span>Hol</span>
                    <span className="text-slate-900">Net</span>
                  </div>
                  
                  {DENOMINATIONS.map(d => {
                    const b = base[id]?.[d] || 0;
                    const i = (dailyIncreases[selectedDate]?.[id] || []).reduce((s: any, e: any) => s + (Number(e[d]) || 0), 0);
                    const h = hol.counts[d];
                    const net = b + i + h;
                    return (
                      <div key={d} className="grid grid-cols-5 text-xs font-mono items-center text-right group-hover:bg-slate-50/50 transition-colors py-1 rounded">
                        <span className="text-left font-bold text-slate-900">{d}</span>
                        <span className="text-slate-400">{b}</span>
                        <span className="text-slate-400">{i}</span>
                        <span className="text-slate-400">{h}</span>
                        <span className="font-black" style={{ color: ATM_COLORS[id] }}>{net}</span>
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Machine Net</p>
                    <p className="text-lg font-black" style={{ color: ATM_COLORS[id] }}>
                      {fmt(calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }) + (dailyIncreases[selectedDate]?.[id] || []).reduce((s: any, e: any) => s + calcTotal(e), 0) + hol.amount)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <div className="p-1.5 bg-slate-100 rounded-lg">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

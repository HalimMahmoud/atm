import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AppState, Action, Holiday, HolidayDay, IncreaseEntry, Counts, Denomination } from "../types";
import { holidaySchema, type HolidayInput } from "../schemas";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt, todayStr } from "../utils";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";
import { Btn } from "./shared/Btn";
import { CounterInput } from "./shared/CounterInput";
import { LedgerTable } from "./ledger/LedgerTable";
import { Calendar, PlusCircle, Settings, Trash2, ShieldCheck, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function HolidayView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const { holidays, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  const activeHol = holidays[0] || null;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset: resetForm, setValue } = useForm<any>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: "",
      startDate: todayStr(),
      endDate: todayStr(),
      initialCounts: { 200: 0, 100: 0, 50: 0, 10: 0 }
    }
  });

  const create = (data: HolidayInput) => {
    const start = new Date(data.startDate), end = new Date(data.endDate);
    const days: HolidayDay[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().slice(0, 10);
      days.push({
        date,
        feedings: ATM_IDS.reduce((a, id) => ({ ...a, [id]: [] }), {}),
        dispensed: ATM_IDS.reduce((a, id) => ({ ...a, [id]: { 200: 0, 100: 0, 50: 0, 10: 0 } }), {}),
      });
    }
    dispatch({ type: "ADD_HOLIDAY", holiday: { id: Date.now(), ...data, days } as Holiday });
    resetForm();
  };

  if (!activeHol) return <InitializationForm register={register} handleSubmit={handleSubmit} create={create} errors={errors} setValue={setValue} />;

  const getPoolInfo = () => {
    const initial = calcTotal(activeHol.initialCounts);
    const fedDenom = DENOMINATIONS.reduce((acc, den) => {
      acc[den] = activeHol.days.reduce((s, d) => s + ATM_IDS.reduce((as, id) => as + (d.feedings[id] || []).reduce((fs, f) => fs + (Number(f[den]) || 0), 0), 0), 0);
      return acc;
    }, { 200: 0, 100: 0, 50: 0, 10: 0 } as Counts);
    
    const fed = Object.keys(fedDenom).reduce((s, k) => s + fedDenom[Number(k) as Denomination] * Number(k), 0);
    const remaining = initial - fed;
    const remainCounts = DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: activeHol.initialCounts[d] - fedDenom[d] }), {} as Counts);
    
    return { initial, fed, remaining, remainCounts };
  };

  const pool = getPoolInfo();

  return (
    <div className="space-y-6">
      <Header 
        activeHol={activeHol} 
        isSettingsOpen={isSettingsOpen} 
        setIsSettingsOpen={setIsSettingsOpen} 
        pool={pool}
      />
      
      {isSettingsOpen && (
        <SettingsPanel 
          activeHol={activeHol} 
          dispatch={dispatch} 
          setIsSettingsOpen={setIsSettingsOpen} 
        />
      )}
      
      <LedgerTable 
        columns={ATM_IDS.map(id => ({ key: id, label: id, color: ATM_COLORS[id] }))}
        rows={activeHol.days.map(d => ({ 
          id: d.date, 
          mainLabel: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
          rowSpan: DENOMINATIONS.length + 2
        }))}
        subRowItems={[...DENOMINATIONS, "Note", "Total"]}
        renderSideHeader={(item) => (
           item === "Total" ? "Day Feeding Total" : 
           item === "Note" ? "Feeding Note" : 
           typeof item === "number" ? `× ${item} EGP` : item
        )}
        renderCell={(date, item, atmId) => {
          const dy = activeHol.days.find(d => d.date === date)!;
          const f = dy.feedings[atmId]?.[0] || { id: 0, 200: 0, 100: 0, 50: 0, 10: 0, note: "" };
          
          const upd = (field: keyof IncreaseEntry, val: any) => {
            if (f.id === 0) {
              dispatch({ type: "HOLIDAY_ADD_FEEDING", holidayId: activeHol.id, date, atmId, entry: { id: Date.now(), 200: 0, 100: 0, 50: 0, 10: 0, note: "", [field]: val } });
            } else {
              dispatch({ type: "HOLIDAY_UPDATE_FEEDING", holidayId: activeHol.id, date, atmId, feedId: f.id, field, val });
            }
          };

          const cellClass = "p-0 border-r border-slate-100 last:border-r-0 h-10 text-center align-middle transition-colors";

          if (typeof item === "number") {
            const d = item as Denomination;
            const cur = Number(f[d]) || 0;
            return (
              <td className={cellClass}>
                <CounterInput 
                  variant="cell" 
                  value={cur} 
                  max={pool.remainCounts[d] + cur} 
                  onChange={(v) => upd(d as any, v)} 
                />
              </td>
            );
          }
          if (item === "Note") {
            return (
              <td className={cellClass}>
                <input 
                  value={f.note || ""} 
                  onChange={e => upd("note", e.target.value)} 
                  className="w-full h-full bg-transparent text-center text-[10px] text-slate-500 outline-none placeholder:text-slate-300" 
                  placeholder="..." 
                />
              </td>
            );
          }
          const total = calcTotal(f as Counts);
          return (
            <td 
              className={cn(
                cellClass,
                "font-bold text-[10px] font-mono",
                total > 0 ? "bg-slate-900 text-white" : "bg-slate-50/50 text-slate-300"
              )}
            >
              {total > 0 ? fmt(total) : "-"}
            </td>
          );
        }}
      />

      <Summary pool={pool} />
    </div>
  );
}

function InitializationForm({ register, handleSubmit, create, errors, setValue }: any) {
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Card className="p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Holiday Initialization</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Set up your vault pool and holiday schedule to begin management.</p>
        </div>

        <form onSubmit={handleSubmit(create)} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Holiday Campaign Name</label>
              <input 
                {...register("name")} 
                placeholder="e.g. Eid Al-Fitr 2024"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm font-semibold transition-all outline-none",
                  errors.name ? "border-red-200 focus:border-red-400" : "border-slate-200 focus:border-slate-400"
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    {...register("startDate")} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-slate-400" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    {...register("endDate")} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-slate-400" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Global Vault Custody (Pool)</label>
            <div className="grid grid-cols-2 gap-3">
              {DENOMINATIONS.map((d) => (
                <div key={d} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500">× {d} EGP</span>
                  <CounterInput value={0} onChange={(v) => setValue(`initialCounts.${d}`, v)} />
                </div>
              ))}
            </div>
          </div>

          <Btn type="submit" variant="primary" className="w-full py-4 text-base shadow-lg shadow-slate-200">
            Create Holiday Schedule
          </Btn>
        </form>
      </Card>
    </div>
  );
}

function Header({ activeHol, isSettingsOpen, setIsSettingsOpen, pool }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Active Schedule</span>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeHol.name}</h2>
          <Badge color="blue" className="px-3 py-1 text-[11px]">
            {activeHol.startDate} <ArrowRight className="w-3 h-3 inline mx-1" /> {activeHol.endDate}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-soft">
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Vault Remaining</p>
            <p className={cn(
              "text-lg font-black leading-none mt-1.5",
              pool.remaining < 0 ? "text-red-600" : "text-slate-900"
            )}>
              EGP {fmt(pool.remaining)}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              isSettingsOpen ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            <Settings className={cn("w-5 h-5", isSettingsOpen && "animate-spin-slow")} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ activeHol, dispatch, setIsSettingsOpen }: any) {
  return (
    <Card className="bg-slate-50/50 border-slate-200 border-dashed relative overflow-visible">
      <div className="absolute -top-3 left-6 px-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-x border-slate-200">
        Configuration Panel
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 py-2">
        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modify Date Range</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              defaultValue={activeHol.startDate} 
              id="edit-start" 
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-slate-400" 
            />
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <input 
              type="date" 
              defaultValue={activeHol.endDate} 
              id="edit-end" 
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-slate-400" 
            />
          </div>
          <Btn 
            size="sm" 
            className="w-full"
            onClick={() => {
              const s = (document.getElementById("edit-start") as HTMLInputElement).value;
              const e = (document.getElementById("edit-end") as HTMLInputElement).value;
              const start = new Date(s), end = new Date(e), dates = [];
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) dates.push(d.toISOString().slice(0, 10));
              dispatch({ type: "HOLIDAY_SYNC_DAYS", holidayId: activeHol.id, dates });
              setIsSettingsOpen(false);
            }}
          >
            Update Range
          </Btn>
        </div>

        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Vault Custody</label>
          <div className="grid grid-cols-2 gap-2">
            {DENOMINATIONS.map(d => (
              <div key={d} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">× {d}</span>
                <CounterInput 
                  value={activeHol.initialCounts[d]} 
                  onChange={(v) => dispatch({ type: "HOLIDAY_UPDATE_INITIAL_COUNTS", holidayId: activeHol.id, counts: { ...activeHol.initialCounts, [d]: v } })} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-48 flex lg:flex-col justify-end gap-3">
          <Btn 
            variant="danger" 
            size="sm" 
            className="flex-1 lg:flex-none py-2"
            onClick={() => confirm("Are you sure you want to delete this entire holiday schedule?") && dispatch({ type: "REMOVE_HOLIDAY", holidayId: activeHol.id })}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Btn>
          <Btn 
            variant="ghost" 
            size="sm" 
            className="flex-1 lg:flex-none py-2"
            onClick={() => setIsSettingsOpen(false)}
          >
            Cancel
          </Btn>
        </div>
      </div>
    </Card>
  );
}

function Summary({ pool }: any) {
  return (
    <Card className="border-slate-200 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Wallet className="w-3 h-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Total Pool</p>
          </div>
          <p className="text-2xl font-black text-slate-900">EGP {fmt(pool.initial)}</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-3 h-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Total Fed</p>
          </div>
          <p className="text-2xl font-black text-red-500">−EGP {fmt(pool.fed)}</p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl md:-m-5 md:ml-4 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheck className="w-3 h-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Remaining Credit</p>
          </div>
          <p className={cn(
            "text-3xl font-black",
            pool.remaining < 0 ? "text-red-400" : "text-white"
          )}>
            EGP {fmt(pool.remaining)}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Denomination Availability</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DENOMINATIONS.map(d => (
            <div key={d} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">× {d} EGP</div>
              <div className={cn(
                "text-xl font-black",
                pool.remainCounts[d] <= 0 ? "text-red-600" : "text-slate-900"
              )}>
                {pool.remainCounts[d]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

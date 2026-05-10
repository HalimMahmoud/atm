import React, { useState } from "react";
import type { AppState, Action, BaseData } from "../types";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { CounterInput } from "./shared/CounterInput";
import { Lock, Settings, Trash2, Save, X, Cpu } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SettingsView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tempBase, setTempBase] = useState<BaseData>(state.base);
  const [tempCount, setTempCount] = useState(state.atmCount);

  const ATM_IDS = Array.from({ length: tempCount }, (_, i) => `ATM ${i + 1}`);

  const login = () => {
    if (pin === "1234") {
      setIsAdmin(true);
      setError("");
    } else {
      setError("Invalid PIN");
    }
  };

  const saveBase = () => {
    dispatch({ type: "SET_BASE", base: tempBase });
    dispatch({ type: "UPDATE_ATM_COUNT", count: tempCount });
    setIsAdmin(false);
    setPin("");
  };

  const reset = () => {
    if (confirm("Are you sure? This will delete all increases and holiday schedules!")) {
      dispatch({ type: "RESET_ALL" });
    }
  };

  if (!isAdmin)
    return (
      <div className="flex justify-center py-12 md:py-24 px-4">
        <Card className="w-full max-w-sm p-8 text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 mb-2">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Access</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Enter Super Admin PIN to manage fleet configuration and base custody levels.</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-center text-xl font-bold tracking-[0.5em] transition-all outline-none",
                error ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-slate-50 focus:border-slate-400"
              )}
            />
            {error && <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{error}</p>}
            <Btn variant="primary" className="w-full py-4 text-base" onClick={login}>
              Authorize Session
            </Btn>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Btn variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={reset}>
              <Trash2 className="w-4 h-4 mr-2" />
              Factory Reset App
            </Btn>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Admin Control</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Configuration</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Modify active ATMs and their respective base custody levels.</p>
        </div>

        <div className="flex items-center gap-2">
          <Btn variant="primary" onClick={saveBase}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Btn>
          <Btn variant="default" onClick={() => setIsAdmin(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Btn>
        </div>
      </div>

      <Card className="bg-slate-900 text-white border-none p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Active Fleet Size</h3>
            <p className="text-xs text-slate-400">Drag to adjust the number of operational terminals.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={tempCount} 
            onChange={(e) => {
              const newCount = parseInt(e.target.value);
              setTempCount(newCount);
              const newBase = { ...tempBase };
              for(let i=1; i<=newCount; i++) {
                const id = `ATM ${i}`;
                if(!newBase[id]) {
                  newBase[id] = { 200: 0, 100: 0, 50: 0, 10: 0 };
                }
              }
              setTempBase(newBase);
            }} 
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-400 tracking-tighter">{tempCount}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Terminals</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ATM_IDS.map((id) => (
          <Card key={id} className="relative overflow-hidden pt-6">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ background: ATM_COLORS[id] || "#0f172a" }}
            />
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="font-bold text-sm" style={{ color: ATM_COLORS[id] || "#0f172a" }}>{id}</span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Total</span>
                <span className="text-xs font-mono font-black" style={{ color: ATM_COLORS[id] }}>
                  {fmt(calcTotal(tempBase[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-2">
              {DENOMINATIONS.map((d) => (
                <div key={d} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">EGP {d}</label>
                  <CounterInput
                    value={tempBase[id]?.[d] || 0}
                    onChange={(v) => setTempBase({ ...tempBase, [id]: { ...(tempBase[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }), [d]: v } })}
                  />
                  <p className="text-[9px] text-slate-400 font-mono text-right font-medium">
                    {fmt((tempBase[id]?.[d] || 0) * d)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

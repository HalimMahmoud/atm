import { useReducer, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { initState, saveState } from "./utils";
import { reducer } from "./reducer";
import { BaseView } from "./components/BaseView";
import { IncreasesView } from "./components/IncreasesView";
import { HolidayView } from "./components/HolidayView";
import { SettingsView } from "./components/SettingsView";
import { MasterStatusView } from "./components/MasterStatusView";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, initState);
  const { activeTab } = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const tabs = [
    { id: "base", label: "Base", icon: LayoutDashboard },
    { id: "increases", label: "Increases", icon: TrendingUp },
    { id: "holiday", label: "Holiday", icon: Calendar },
    { id: "status", label: "Status", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">ATM</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Custody Manager</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => dispatch({ type: "SET_TAB", tab: id as any })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <Icon className={cn("w-4 h-4", activeTab === id ? "text-slate-900" : "text-slate-400")} />
                {label}
              </button>
            ))}
          </nav>

          <div className="md:hidden">
             {/* Mobile active tab indicator or menu trigger could go here */}
             <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
               {tabs.find(t => t.id === activeTab)?.label}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "base" && <BaseView state={state} />}
            {activeTab === "increases" && <IncreasesView state={state} dispatch={dispatch} />}
            {activeTab === "holiday" && <HolidayView state={state} dispatch={dispatch} />}
            {activeTab === "status" && <MasterStatusView state={state} />}
            {activeTab === "settings" && <SettingsView state={state} dispatch={dispatch} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav - Fixed Bottom */}
      <nav className="md:hidden sticky bottom-0 z-50 bg-white border-t border-slate-200 px-4 py-2 pb-6 flex justify-around items-center">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => dispatch({ type: "SET_TAB", tab: id as any })}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200",
              activeTab === id ? "text-slate-900" : "text-slate-400"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              activeTab === id ? "bg-slate-100" : "bg-transparent"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer (Desktop Only) */}
      <footer className="hidden md:block py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Banking Ops Systems • Secure Terminal Management v3.0
          </p>
        </div>
      </footer>
    </div>
  );
}

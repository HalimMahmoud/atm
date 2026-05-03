import type { AppState, Counts, BaseData } from "./types";
import { DENOMINATIONS } from "./types";

export const calcTotal = (counts: Partial<Counts>) =>
  DENOMINATIONS.reduce((sum, d) => sum + (Number(counts[d] ?? 0) || 0) * d, 0);

export const fmt = (n: number) => Math.round(n).toLocaleString("en-EG");

export const todayStr = () => new Date().toISOString().slice(0, 10);

const STORAGE_KEY = "atm_custody_v3";

export function loadState(): AppState | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveState(s: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.error("Save state failed", e);
  }
}



export const DEFAULT_BASE: BaseData = {
  "ATM 1": { 200: 1500, 100: 500, 50: 200, 10: 100 },
  "ATM 2": { 200: 1500, 100: 500, 50: 200, 10: 100 },
  "ATM 3": { 200: 1000, 100: 500, 50: 200, 10: 100 },
  "ATM 4": { 200: 1500, 100: 500, 50: 200, 10: 100 },
};

export const initState = (): AppState => {
  const saved = loadState();
  if (saved) return saved;
  return {
    base: DEFAULT_BASE,
    dailyIncreases: {},
    holidays: [],
    activeTab: "base",
    selectedDate: todayStr(),
    atmCount: 4,
  };
};

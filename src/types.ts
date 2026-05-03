export type Denomination = 200 | 100 | 50 | 10;
export const DENOMINATIONS = [10, 50, 100, 200] as const;

export type AtmId = string;

export const ATM_COLORS: Record<string, string> = {
  "ATM 1": "#185FA5", // Signature Blue
  "ATM 2": "#059669", // Emerald
  "ATM 3": "#7C3AED", // Violet
  "ATM 4": "#D97706", // Amber
  "ATM 5": "#DC2626", // Red
  "ATM 6": "#0891B2", // Cyan
  "ATM 7": "#DB2777", // Pink
  "ATM 8": "#4F46E5", // Indigo
  "ATM 9": "#0D9488", // Teal
  "ATM 10": "#EA580C", // Orange
};

export type Tab = "base" | "increases" | "holiday" | "status" | "settings";

export type Counts = {
  200: number;
  100: number;
  50: number;
  10: number;
};

export type BaseData = Record<AtmId, Counts>;

export type IncreaseEntry = Counts & {
  id: number;
  note?: string;
};

export type DailyIncreases = Record<string, Record<AtmId, IncreaseEntry[]>>;

export type HolidayDay = {
  date: string;
  feedings: Record<AtmId, IncreaseEntry[]>;
  dispensed: Record<AtmId, Counts>;
};

export type Holiday = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  initialCounts: Counts;
  days: HolidayDay[];
};

export type AppState = {
  base: BaseData;
  dailyIncreases: DailyIncreases;
  holidays: Holiday[];
  activeTab: Tab;
  selectedDate: string;
  atmCount: number;
};

export type Action =
  | { type: "SET_DATE"; date: string }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "SET_BASE"; base: BaseData }
  | { type: "ADD_INCREASE"; date: string; atmId: AtmId; entry: IncreaseEntry }
  | { type: "UPDATE_INCREASE"; date: string; atmId: AtmId; id: number; field: keyof IncreaseEntry; val: string | number }
  | { type: "REMOVE_INCREASE"; date: string; atmId: AtmId; id: number }
  | { type: "ADD_HOLIDAY"; holiday: Holiday }
  | { type: "HOLIDAY_ADD_FEEDING"; holidayId: number; date: string; atmId: AtmId; entry: IncreaseEntry }
  | { type: "HOLIDAY_UPDATE_FEEDING"; holidayId: number; date: string; atmId: AtmId; feedId: number; field: keyof IncreaseEntry; val: string | number }
  | { type: "HOLIDAY_REMOVE_FEEDING"; holidayId: number; date: string; atmId: AtmId; feedId: number }
  | { type: "HOLIDAY_UPDATE_DISPENSED"; holidayId: number; date: string; atmId: AtmId; den: Denomination; val: number }
  | { type: "HOLIDAY_UPDATE_INITIAL_COUNTS"; holidayId: number; counts: Counts }
  | { type: "HOLIDAY_SYNC_DAYS"; holidayId: number; dates: string[] }
  | { type: "REMOVE_HOLIDAY"; holidayId: number }
  | { type: "UPDATE_ATM_COUNT"; count: number }
  | { type: "RESET_ALL" };

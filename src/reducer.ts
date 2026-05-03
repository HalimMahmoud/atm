import type { AppState, Action, Holiday, HolidayDay, Counts } from "./types";
import { DEFAULT_BASE, todayStr } from "./utils";

const EMPTY_COUNTS: Counts = { 200: 0, 100: 0, 50: 0, 10: 0 };

const updateHolidays = (state: AppState, holidayId: number, fn: (h: Holiday) => Holiday): AppState => ({
  ...state,
  holidays: state.holidays.map(h => h.id === holidayId ? fn(h) : h)
});

const updateDays = (h: Holiday, date: string, fn: (d: HolidayDay) => HolidayDay): Holiday => ({
  ...h,
  days: h.days.map(d => d.date === date ? fn(d) : d)
});

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, selectedDate: action.date };
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "SET_BASE":
      return { ...state, base: action.base };

    case "ADD_INCREASE": {
      const d = state.dailyIncreases[action.date] || {};
      return {
        ...state,
        dailyIncreases: {
          ...state.dailyIncreases,
          [action.date]: { ...d, [action.atmId]: [...(d[action.atmId] || []), action.entry] },
        },
      };
    }

    case "UPDATE_INCREASE": {
      const d = state.dailyIncreases[action.date] || {};
      return {
        ...state,
        dailyIncreases: {
          ...state.dailyIncreases,
          [action.date]: {
            ...d,
            [action.atmId]: (d[action.atmId] || []).map(e => e.id === action.id ? { ...e, [action.field]: action.val } : e),
          },
        },
      };
    }

    case "REMOVE_INCREASE": {
      const d = state.dailyIncreases[action.date] || {};
      return {
        ...state,
        dailyIncreases: {
          ...state.dailyIncreases,
          [action.date]: { ...d, [action.atmId]: (d[action.atmId] || []).filter(e => e.id !== action.id) },
        },
      };
    }

    case "ADD_HOLIDAY":
      return { ...state, holidays: [...state.holidays, action.holiday] };

    case "REMOVE_HOLIDAY":
      return { ...state, holidays: state.holidays.filter(h => h.id !== action.holidayId) };

    case "HOLIDAY_ADD_FEEDING":
      return updateHolidays(state, action.holidayId, h => updateDays(h, action.date, d => ({
        ...d,
        feedings: { ...d.feedings, [action.atmId]: [...(d.feedings[action.atmId] || []), action.entry] }
      })));

    case "HOLIDAY_UPDATE_FEEDING":
      return updateHolidays(state, action.holidayId, h => updateDays(h, action.date, d => ({
        ...d,
        feedings: { 
          ...d.feedings, 
          [action.atmId]: (d.feedings[action.atmId] || []).map(f => f.id === action.feedId ? { ...f, [action.field]: action.val } : f) 
        }
      })));

    case "HOLIDAY_REMOVE_FEEDING":
      return updateHolidays(state, action.holidayId, h => updateDays(h, action.date, d => ({
        ...d,
        feedings: { ...d.feedings, [action.atmId]: (d.feedings[action.atmId] || []).filter(f => f.id !== action.feedId) }
      })));

    case "HOLIDAY_UPDATE_DISPENSED":
      return updateHolidays(state, action.holidayId, h => updateDays(h, action.date, d => ({
        ...d,
        dispensed: {
          ...d.dispensed,
          [action.atmId]: { ...(d.dispensed[action.atmId] || { ...EMPTY_COUNTS }), [action.den]: action.val }
        }
      })));

    case "HOLIDAY_UPDATE_INITIAL_COUNTS":
      return updateHolidays(state, action.holidayId, h => ({ ...h, initialCounts: action.counts }));

    case "HOLIDAY_SYNC_DAYS":
      return updateHolidays(state, action.holidayId, h => {
        const newDays = action.dates.map(date => h.days.find(d => d.date === date) || { date, feedings: {}, dispensed: {} });
        newDays.sort((a, b) => a.date.localeCompare(b.date));
        return { 
          ...h, 
          days: newDays, 
          startDate: newDays[0]?.date || "", 
          endDate: newDays[newDays.length - 1]?.date || "" 
        };
      });

    case "UPDATE_ATM_COUNT":
      return { ...state, atmCount: action.count };

    case "RESET_ALL":
      return {
        base: DEFAULT_BASE,
        dailyIncreases: {},
        holidays: [],
        activeTab: "base",
        selectedDate: todayStr(),
        atmCount: 4,
      };

    default:
      return state;
  }
}

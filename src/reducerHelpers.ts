import type { Counts, Holiday, HolidayDay, AppState } from "./types";

export const EMPTY_COUNTS: Counts = { 200: 0, 100: 0, 50: 0, 10: 0 };

export function updateHoliday(state: AppState, holidayId: number, callback: (h: Holiday) => Holiday): AppState {
  return {
    ...state,
    holidays: state.holidays.map((h) => (h.id === holidayId ? callback(h) : h)),
  };
}

export function updateHolidayDay(holiday: Holiday, date: string, callback: (d: HolidayDay) => HolidayDay): Holiday {
  return {
    ...holiday,
    days: holiday.days.map((d) => (d.date === date ? callback(d) : d)),
  };
}

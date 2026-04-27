import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { LAKE } from "./lake";

export function todayAtLake(): Date {
  return toZonedTime(new Date(), LAKE.timezone);
}

export function todayIsoAtLake(): string {
  return formatInTimeZone(new Date(), LAKE.timezone, "yyyy-MM-dd");
}

export function parseLocalDate(iso: string): Date {
  return parseISO(iso);
}

export function formatStayRange(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  if (startIso === endIso) {
    return format(start, "EEE, MMM d");
  }
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "EEE, MMM d")} → ${format(end, "EEE d")}`;
  }
  return `${format(start, "MMM d")} → ${format(end, "MMM d")}`;
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "EEE, MMM d");
}

export function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function parseMonthKey(key: string): Date {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function monthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function shiftMonth(date: Date, delta: number): Date {
  return addMonths(date, delta);
}

export function monthGridDays(monthDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

export function monthRangeIso(monthDate: Date): { start: string; end: string } {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end = addDays(start, 41);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}

export function isoFromDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function isInRange(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

export { endOfMonth };

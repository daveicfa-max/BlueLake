import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { getStaysInRange, getUpcomingStays } from "@/lib/stays";
import {
  formatStayRange,
  isInRange,
  isoFromDate,
  isSameMonth,
  monthGridDays,
  monthKey,
  monthLabel,
  monthRangeIso,
  parseMonthKey,
  shiftMonth,
  todayIsoAtLake,
} from "@/lib/dates";
import type { StayWithProfile } from "@/lib/types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function firstName(stay: StayWithProfile): string {
  if (stay.guest_name && stay.guest_name.trim()) {
    return stay.guest_name.trim().split(/\s+/)[0];
  }
  const fn = stay.profile?.full_name?.trim();
  if (fn) return fn.split(/\s+/)[0];
  return "Someone";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const today = todayIsoAtLake();
  const monthDate = month ? parseMonthKey(month) : parseMonthKey(today.slice(0, 7));
  const range = monthRangeIso(monthDate);

  const [stays, upcoming] = await Promise.all([
    getStaysInRange(range.start, range.end),
    getUpcomingStays(8),
  ]);

  const days = monthGridDays(monthDate);
  const prevMonth = monthKey(shiftMonth(monthDate, -1));
  const nextMonth = monthKey(shiftMonth(monthDate, 1));

  return (
    <PageScaffold eyebrow="The lake" title="Who's at the lake.">
      <div className="flex flex-col gap-5">
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <header className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
            <Link
              href={`/calendar?month=${prevMonth}`}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <p className="font-display text-base tracking-tight text-foreground">
              {monthLabel(monthDate)}
            </p>
            <Link
              href={`/calendar?month=${nextMonth}`}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid grid-cols-7 px-1 pt-2 pb-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <p
                key={i}
                className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground py-1"
              >
                {d}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border/60 px-px pb-px">
            {days.map((day) => {
              const iso = isoFromDate(day);
              const dayStays = stays.filter((s) =>
                isInRange(iso, s.start_date, s.end_date),
              );
              const inMonth = isSameMonth(day, monthDate);
              const isToday = iso === today;
              return (
                <div
                  key={iso}
                  className={`relative bg-card min-h-[52px] flex flex-col items-center pt-1.5 px-0.5 ${
                    inMonth ? "" : "bg-muted/30"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-brand-sunset-ember text-white font-medium"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayStays.length > 0 && (
                    <span className="mt-1 flex gap-0.5">
                      {dayStays.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          aria-hidden
                          className="block h-1 w-1 rounded-full bg-brand-pine"
                        />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Upcoming
            </p>
            <Link
              href="/calendar/new"
              className="flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium active:scale-95 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add stay
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground text-pretty">
                No stays on the books. Add the first one above.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((stay) => (
                <li key={stay.id}>
                  <Link
                    href={`/calendar/${stay.id}`}
                    className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card px-4 py-3 active:bg-muted/40 transition"
                  >
                    <p className="font-display text-base tracking-tight text-foreground">
                      {firstName(stay)}
                      {stay.start_date <= today && stay.end_date >= today && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-brand-pine/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-brand-pine">
                          Here now
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatStayRange(stay.start_date, stay.end_date)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageScaffold>
  );
}

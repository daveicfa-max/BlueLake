import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { LAKE } from "@/lib/lake";
import { sunsetUtc, formatLocalTime } from "@/lib/sun";
import { getCurrentWeather } from "@/lib/weather";
import { getCurrentStay, getNextStay } from "@/lib/stays";
import { formatStayRange, todayIsoAtLake } from "@/lib/dates";
import type { StayWithProfile } from "@/lib/types";

function firstNameFromEmail(email: string | null | undefined): string {
  if (!email) return "";
  const handle = email.split("@")[0]?.split(/[._-]/)[0] ?? "";
  if (!handle) return "";
  return handle.charAt(0).toUpperCase() + handle.slice(1).toLowerCase();
}

function formatDateLine(date: Date) {
  const dow = new Intl.DateTimeFormat("en-US", {
    timeZone: LAKE.timezone,
    weekday: "long",
  }).format(date);
  const md = new Intl.DateTimeFormat("en-US", {
    timeZone: LAKE.timezone,
    month: "long",
    day: "numeric",
  }).format(date);
  return `${dow} · ${md}`;
}

function stayName(stay: StayWithProfile): string {
  if (stay.guest_name && stay.guest_name.trim()) {
    return stay.guest_name.trim();
  }
  return stay.profile?.full_name?.trim() || "Someone";
}

function daysUntil(startIso: string, todayIso: string): string {
  const days = differenceInCalendarDays(parseISO(startIso), parseISO(todayIso));
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 14) return "Next week";
  if (days < 30) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: userData }, weather, currentStay, nextStay] = await Promise.all([
    supabase.auth.getUser(),
    getCurrentWeather(),
    getCurrentStay(),
    getNextStay(),
  ]);

  const now = new Date();
  const firstName = firstNameFromEmail(userData.user?.email);
  const sunset = sunsetUtc(now, LAKE.latitude, LAKE.longitude);
  const sunsetLabel = formatLocalTime(sunset, LAKE.timezone);
  const today = todayIsoAtLake();

  return (
    <div>
      <section className="relative h-[78dvh] min-h-[520px] w-full overflow-hidden">
        <Image
          src="/branding/sunset-hero.jpg"
          alt="Sunset over Blue Lake from the dock"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,29,40,0.0)_30%,rgba(15,29,40,0.45)_60%,rgba(15,29,40,0.85)_100%)]"
        />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-7">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-white/70">
            {formatDateLine(now)}
          </p>
          <h1 className="mt-2 font-display text-4xl text-white text-balance">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-white">
            {weather && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-data text-2xl tracking-tight">
                  {weather.temperature}°
                </span>
                <span className="text-sm text-white/80">
                  {weather.description}
                </span>
              </div>
            )}
            {sunsetLabel && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                  Sunset
                </span>
                <span className="font-data text-base">{sunsetLabel}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 px-4 pb-8 pt-5">
        <NextStayCard stay={nextStay} today={today} />
        <CurrentStayCard stay={currentStay} />
        <div className="grid grid-cols-2 gap-3">
          <TasksCard />
          <MaintenanceCard />
        </div>
      </div>
    </div>
  );
}

function NextStayCard({
  stay,
  today,
}: {
  stay: StayWithProfile | null;
  today: string;
}) {
  if (!stay) {
    return (
      <Link
        href="/calendar/new"
        className="overflow-hidden rounded-2xl border border-border border-dashed bg-card/60 active:bg-muted/40 transition"
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-2.5">
          <span className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Next stay
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Nothing on the calendar. Add one.
          </p>
          <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/calendar/${stay.id}`}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(15,29,40,0.04)] active:bg-muted/40 transition"
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-2.5">
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Next stay
        </span>
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-brand-sunset-ember">
          {daysUntil(stay.start_date, today)}
        </span>
      </div>
      <div className="px-5 py-4">
        <p className="font-display text-2xl tracking-tight text-foreground">
          {formatStayRange(stay.start_date, stay.end_date)}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {stayName(stay)} arriving.
        </p>
      </div>
    </Link>
  );
}

function CurrentStayCard({ stay }: { stay: StayWithProfile | null }) {
  if (!stay) {
    return (
      <Link
        href="/calendar"
        className="overflow-hidden rounded-2xl border border-border bg-card active:bg-muted/40 transition"
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-2.5">
          <span className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            At the lake now
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="font-display text-lg tracking-tight text-foreground">
            Nobody's there.
          </p>
          <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/calendar/${stay.id}`}
      className="overflow-hidden rounded-2xl border border-brand-pine/40 bg-brand-pine/5 active:bg-brand-pine/10 transition"
    >
      <div className="flex items-center justify-between border-b border-brand-pine/20 bg-brand-pine/10 px-5 py-2.5">
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-brand-pine">
          At the lake now
        </span>
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-brand-pine">
          Until {new Date(stay.end_date).toLocaleDateString("en-US", { weekday: "short" })}
        </span>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-display text-xl tracking-tight text-foreground">
          {stayName(stay)}.
        </p>
        <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function TasksCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Tasks
        </span>
      </div>
      <div className="px-4 py-4">
        <p className="font-display text-3xl tracking-tight text-foreground">
          0 <span className="text-base text-muted-foreground">open</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Coming soon.</p>
      </div>
    </article>
  );
}

function MaintenanceCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Maintenance
        </span>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Wrench aria-hidden className="h-4 w-4 text-brand-sunset-ember" />
          <p className="font-display text-base tracking-tight text-foreground">
            Nothing due
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Coming soon.</p>
      </div>
    </article>
  );
}

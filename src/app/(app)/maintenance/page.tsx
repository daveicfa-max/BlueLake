import Link from "next/link";
import { ChevronRight, Plus, Wrench } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { getSchedules } from "@/lib/maintenance";

function daysUntil(iso: string): number {
  const due = new Date(iso).getTime();
  const now = Date.now();
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function dueLabel(iso: string): { text: string; tone: "overdue" | "soon" | "ok" } {
  const days = daysUntil(iso);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "overdue" };
  if (days === 0) return { text: "due today", tone: "overdue" };
  if (days <= 30) return { text: `due in ${days}d`, tone: "soon" };
  if (days <= 365) return { text: `due in ${Math.round(days / 30)}mo`, tone: "ok" };
  return { text: `due in ${Math.round(days / 365)}y`, tone: "ok" };
}

export default async function MaintenancePage() {
  const schedules = await getSchedules();

  return (
    <PageScaffold
      eyebrow="Property OS"
      title="What needs servicing."
      blurb="Pumps, filters, oil changes, septic. Tap to assign."
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {schedules.length}{" "}
            {schedules.length === 1 ? "schedule" : "schedules"}
          </p>
          <Link
            href="/maintenance/new"
            className="flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium active:scale-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New schedule
          </Link>
        </div>

        {schedules.length === 0 ? (
          <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
            <Wrench className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground text-pretty">
              Add a piece of equipment first, then come back here to schedule
              its service cadence.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {schedules.map((s) => {
              const due = dueLabel(s.next_due_at);
              return (
                <li key={s.id}>
                  <Link
                    href={`/maintenance/${s.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:bg-muted/40 transition"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <p className="font-display text-base tracking-tight text-foreground">
                        {s.equipment?.name ?? "Equipment"}
                        <span className="text-muted-foreground"> · </span>
                        {s.name}
                      </p>
                      <p
                        className={`font-data text-[10px] uppercase tracking-[0.18em] ${
                          due.tone === "overdue"
                            ? "text-destructive"
                            : due.tone === "soon"
                              ? "text-brand-sunset-ember"
                              : "text-muted-foreground"
                        }`}
                      >
                        Every {s.interval_months}mo · {due.text}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageScaffold>
  );
}

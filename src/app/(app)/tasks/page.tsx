import Link from "next/link";
import { CheckCircle2, Circle, Clock, Plus, AlertTriangle } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { getTasks, type TaskView } from "@/lib/tasks";
import { formatShortDate, todayIsoAtLake } from "@/lib/dates";
import type { TaskStatus, TaskWithProfiles } from "@/lib/types";

const TABS: { value: TaskView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "handyman", label: "Handyman" },
  { value: "seasonal", label: "Seasonal" },
];

function statusIcon(status: TaskStatus) {
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 text-brand-pine" aria-hidden />;
  if (status === "in_progress")
    return <Clock className="h-4 w-4 text-brand-sunset-ember" aria-hidden />;
  if (status === "cancelled")
    return <Circle className="h-4 w-4 text-muted-foreground/50" aria-hidden />;
  return <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />;
}

function priorityPill(priority: TaskWithProfiles["priority"]) {
  if (priority === "high") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-destructive">
        <AlertTriangle className="h-2.5 w-2.5" />
        High
      </span>
    );
  }
  if (priority === "low") {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Low
      </span>
    );
  }
  return null;
}

function assigneeName(t: TaskWithProfiles): string | null {
  return t.assignee?.full_name?.trim() || null;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view = (TABS.find((t) => t.value === viewParam)?.value ?? "all") as TaskView;
  const tasks = await getTasks(view);
  const today = todayIsoAtLake();

  return (
    <PageScaffold eyebrow="The lake" title="What needs doing.">
      <div className="flex flex-col gap-5">
        <nav className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
          {TABS.map((tab) => {
            const active = tab.value === view;
            return (
              <Link
                key={tab.value}
                href={
                  tab.value === "all" ? "/tasks" : `/tasks?view=${tab.value}`
                }
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-data text-[11px] uppercase tracking-[0.18em] transition ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between px-1">
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
          <Link
            href="/tasks/new"
            className="flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium active:scale-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              {view === "all"
                ? "Nothing on the list yet. Add the first one above."
                : view === "mine"
                  ? "Nothing assigned to you. Lucky."
                  : view === "handyman"
                    ? "No handyman tasks open."
                    : "No seasonal tasks set up yet."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => {
              const overdue =
                task.due_date &&
                task.due_date < today &&
                task.status !== "done" &&
                task.status !== "cancelled";
              const assigned = assigneeName(task);
              return (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 active:bg-muted/40 transition ${
                      task.status === "done" || task.status === "cancelled"
                        ? "border-border/60 opacity-70"
                        : "border-border"
                    }`}
                  >
                    <div className="pt-0.5">{statusIcon(task.status)}</div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-display text-base tracking-tight ${
                            task.status === "done"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        {priorityPill(task.priority)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        {task.due_date && (
                          <span className={overdue ? "text-destructive" : ""}>
                            {overdue ? "Overdue · " : "Due "}
                            {formatShortDate(task.due_date)}
                          </span>
                        )}
                        {assigned && (
                          <span>
                            {task.due_date ? "·" : ""} {assigned}
                          </span>
                        )}
                        {task.is_seasonal && task.season && (
                          <span className="font-data uppercase tracking-[0.18em] text-[9px] text-brand-sunset-ember">
                            {task.season}
                          </span>
                        )}
                      </div>
                    </div>
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2, UserPlus } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import {
  createTaskFromSchedule,
  deleteSchedule,
  updateSchedule,
} from "../actions";
import { ScheduleForm } from "../schedule-form";
import { getEquipment } from "@/lib/equipment";
import { getScheduleById } from "@/lib/maintenance";
import type { ScheduleFormState } from "../actions";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [schedule, equipment] = await Promise.all([
    getScheduleById(id),
    getEquipment(),
  ]);
  if (!schedule) notFound();

  const updateAction = async (
    prev: ScheduleFormState,
    formData: FormData,
  ): Promise<ScheduleFormState> => {
    "use server";
    return updateSchedule(id, prev, formData);
  };

  const deleteAction = async () => {
    "use server";
    await deleteSchedule(id);
  };

  const assignAction = async () => {
    "use server";
    await createTaskFromSchedule(id);
  };

  return (
    <PageScaffold
      eyebrow={
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Maintenance
        </Link>
      }
      title="Edit schedule."
    >
      <div className="flex flex-col gap-8">
        <form action={assignAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-sunset-ember text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            <UserPlus className="h-4 w-4" />
            Assign as a task
          </button>
        </form>

        <ScheduleForm
          action={updateAction}
          equipment={equipment}
          schedule={schedule}
          submitLabel="Save changes"
        />

        <form action={deleteAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete this schedule
          </button>
        </form>
      </div>
    </PageScaffold>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { deleteEquipment, updateEquipment } from "../actions";
import { EquipmentForm } from "../equipment-form";
import { getEquipmentById } from "@/lib/equipment";
import { getSchedulesByEquipment } from "@/lib/maintenance";
import { formatShortDate } from "@/lib/dates";
import type { EquipmentFormState } from "../actions";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [equipment, schedules] = await Promise.all([
    getEquipmentById(id),
    getSchedulesByEquipment(id),
  ]);
  if (!equipment) notFound();

  const updateAction = async (
    prev: EquipmentFormState,
    formData: FormData,
  ): Promise<EquipmentFormState> => {
    "use server";
    return updateEquipment(id, prev, formData);
  };

  const deleteAction = async () => {
    "use server";
    await deleteEquipment(id);
  };

  return (
    <PageScaffold
      eyebrow={
        <Link
          href="/equipment"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Equipment
        </Link>
      }
      title="Edit equipment."
    >
      <div className="flex flex-col gap-8">
        <EquipmentForm
          action={updateAction}
          equipment={equipment}
          submitLabel="Save changes"
        />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Maintenance schedules
            </h2>
            <Link
              href={`/maintenance/new?equipment_id=${id}`}
              className="flex items-center gap-1 rounded-full bg-muted text-foreground px-3 py-1.5 text-xs font-medium hover:bg-muted/80 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add schedule
            </Link>
          </div>
          {schedules.length === 0 ? (
            <p className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-6 text-center text-sm text-muted-foreground">
              No schedules yet. Add one to track service cadence.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {schedules.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/maintenance/${s.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:bg-muted/40 transition"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className="font-display text-base tracking-tight text-foreground">
                        {s.name}
                      </p>
                      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Every {s.interval_months} mo · next{" "}
                        {formatShortDate(s.next_due_at.slice(0, 10))}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form action={deleteAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete this equipment
          </button>
        </form>
      </div>
    </PageScaffold>
  );
}

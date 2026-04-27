import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { createSchedule } from "../actions";
import { ScheduleForm } from "../schedule-form";
import { getEquipment } from "@/lib/equipment";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ equipment_id?: string }>;
}) {
  const [{ equipment_id }, equipment] = await Promise.all([
    searchParams,
    getEquipment(),
  ]);

  if (equipment.length === 0) {
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
        title="Add equipment first."
        blurb="A schedule needs a piece of equipment to attach to."
      >
        <Link
          href="/equipment/new"
          className="flex h-11 w-full items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition"
        >
          Go add equipment
        </Link>
      </PageScaffold>
    );
  }

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
      title="New schedule."
      blurb="Set the cadence. The dashboard will warn before it's due."
    >
      <ScheduleForm
        action={createSchedule}
        equipment={equipment}
        defaultEquipmentId={equipment_id}
        submitLabel="Add schedule"
      />
    </PageScaffold>
  );
}

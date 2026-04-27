import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { createEquipment } from "../actions";
import { EquipmentForm } from "../equipment-form";

export default function NewEquipmentPage() {
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
      title="Add equipment."
      blurb="Pumps, panels, anything with a serial number."
    >
      <EquipmentForm action={createEquipment} submitLabel="Add equipment" />
    </PageScaffold>
  );
}

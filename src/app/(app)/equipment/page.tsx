import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { getEquipment } from "@/lib/equipment";
import type { Equipment, EquipmentCategory } from "@/lib/types";

const CATEGORY_ORDER: EquipmentCategory[] = [
  "well",
  "septic",
  "hvac",
  "generator",
  "dock",
  "appliance",
  "other",
];

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  hvac: "HVAC",
  septic: "Septic",
  well: "Well",
  dock: "Dock",
  generator: "Generator",
  appliance: "Appliances",
  other: "Other",
};

function groupByCategory(items: Equipment[]) {
  const groups = new Map<EquipmentCategory, Equipment[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({
    category: c,
    items: groups.get(c) ?? [],
  }));
}

export default async function EquipmentPage() {
  const items = await getEquipment();
  const grouped = groupByCategory(items);

  return (
    <PageScaffold eyebrow="Property OS" title="What's on the property.">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          <Link
            href="/equipment/new"
            className="flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium active:scale-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add equipment
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
            <Wrench className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground text-pretty">
              Nothing logged yet. Start with the well pump, generator, or
              septic.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(({ category, items }) => (
              <section key={category} className="flex flex-col gap-2">
                <h2 className="px-1 font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </h2>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/equipment/${item.id}`}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:bg-muted/40 transition"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <p className="font-display text-base tracking-tight text-foreground">
                            {item.name}
                          </p>
                          {(item.model || item.serial) && (
                            <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              {item.model}
                              {item.model && item.serial ? " · " : ""}
                              {item.serial && `SN ${item.serial}`}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageScaffold>
  );
}

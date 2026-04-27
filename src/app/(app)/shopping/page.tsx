import { Check, ShoppingCart, Undo2 } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { getActiveItems, getRecentlyPickedUp } from "@/lib/shopping";
import { QuickAdd } from "./quick-add";
import { markPickedUp, undoPickedUp } from "./actions";
import type { ShoppingItemWithProfiles } from "@/lib/types";

function rowName(i: ShoppingItemWithProfiles): string | null {
  return i.adder?.full_name?.trim() || null;
}

function pickerName(i: ShoppingItemWithProfiles): string | null {
  return i.picker?.full_name?.trim() || null;
}

export default async function ShoppingPage() {
  const [active, recent] = await Promise.all([
    getActiveItems(),
    getRecentlyPickedUp(20),
  ]);

  return (
    <PageScaffold
      eyebrow="Property OS"
      title="Shopping list."
      blurb="Out of salt? Add it. Picked up? Tap the check."
    >
      <div className="flex flex-col gap-6">
        <QuickAdd />

        <section className="flex flex-col gap-2">
          <h2 className="px-1 font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            On the list ({active.length})
          </h2>
          {active.length === 0 ? (
            <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">All caught up.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {active.map((item) => {
                const adder = rowName(item);
                const pickAction = async () => {
                  "use server";
                  await markPickedUp(item.id);
                };
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <form action={pickAction}>
                      <button
                        type="submit"
                        aria-label="Mark picked up"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted active:scale-95 transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className="font-display text-base tracking-tight text-foreground">
                        {item.name}
                      </p>
                      {adder && (
                        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Added by {adder}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {recent.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Picked up
            </h2>
            <ul className="flex flex-col gap-2">
              {recent.map((item) => {
                const picker = pickerName(item);
                const undoAction = async () => {
                  "use server";
                  await undoPickedUp(item.id);
                };
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className="font-display text-base tracking-tight text-muted-foreground line-through">
                        {item.name}
                      </p>
                      {picker && (
                        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Picked up by {picker}
                        </p>
                      )}
                    </div>
                    <form action={undoAction}>
                      <button
                        type="submit"
                        aria-label="Undo"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </PageScaffold>
  );
}

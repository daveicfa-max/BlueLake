import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";

const groups: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "The cabin",
    items: [
      { href: "/equipment", label: "Equipment" },
      { href: "/maintenance", label: "Maintenance" },
      { href: "/inventory", label: "Inventory" },
      { href: "/checklists", label: "Checklists" },
    ],
  },
  {
    label: "Day to day",
    items: [
      { href: "/shopping", label: "Shopping list" },
      { href: "/documents", label: "Documents" },
      { href: "/expenses", label: "Expenses" },
      { href: "/vendors", label: "Vendors" },
      { href: "/thermostat", label: "Thermostat" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/family", label: "Family" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export default function MorePage() {
  return (
    <PageScaffold
      eyebrow="Everything else"
      title="More."
      blurb="The rest of the cabin, drawer by drawer. Lighting up across the next few phases."
    >
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-2">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-1">
              {group.label}
            </p>
            <ul className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border/60">
              {group.items.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center justify-between px-4 py-3.5 text-sm text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <span>{label}</span>
                    <ChevronRight
                      aria-hidden
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="px-1 text-xs text-muted-foreground italic">
          There are no rules at Blue Lake.
        </p>
      </div>
    </PageScaffold>
  );
}

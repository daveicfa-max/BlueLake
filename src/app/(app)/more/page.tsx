import Link from "next/link";

const links = [
  { href: "/equipment", label: "Equipment" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/inventory", label: "Inventory" },
  { href: "/shopping", label: "Shopping list" },
  { href: "/checklists", label: "Checklists" },
  { href: "/documents", label: "Documents" },
  { href: "/expenses", label: "Expenses" },
  { href: "/vendors", label: "Vendors" },
  { href: "/thermostat", label: "Thermostat" },
  { href: "/family", label: "Family" },
  { href: "/settings", label: "Settings" },
];

export default function MorePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">More</h1>
      <ul className="divide-y rounded-lg border bg-card">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
            >
              <span>{label}</span>
              <span aria-hidden className="text-muted-foreground">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        These sections light up across Phases 2–5.
      </p>
    </div>
  );
}

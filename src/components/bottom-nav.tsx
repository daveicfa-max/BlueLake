"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  Home,
  Menu,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const items: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/cameras", label: "Cameras", icon: Video },
  { href: "/more", label: "More", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 border-t border-border/60 bg-background/85 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 pt-2.5 pb-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-transform",
                      active && "stroke-[2.25]",
                    )}
                    aria-hidden
                  />
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-sunset-ember"
                    />
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

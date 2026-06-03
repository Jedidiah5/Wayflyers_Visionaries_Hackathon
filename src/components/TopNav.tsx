"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/ads", label: "Ads" },
  { href: "/chat", label: "Chat" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background px-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-display text-2xl uppercase tracking-tight text-text-primary"
        >
          Fly Intelligence
        </Link>
      </div>

      <div className="flex h-full items-center gap-8">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-[11px] uppercase tracking-widest transition-colors",
                isActive
                  ? "border-b-2 border-accent pb-1 text-accent"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

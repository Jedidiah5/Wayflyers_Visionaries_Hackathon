"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { FlyWordmark } from "./FlyLogo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/ads", label: "Ads" },
  { href: "/chat", label: "Chat" },
];

export function TopNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-background px-4 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="transition-opacity hover:opacity-90"
          onClick={() => setMenuOpen(false)}
        >
          <FlyWordmark logoSize={28} />
        </Link>

        <div className="hidden h-full items-center gap-6 md:flex md:gap-8">
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

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-text-primary md:hidden"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/60 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed left-0 right-0 top-14 z-40 border-b border-border bg-background md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block border-b border-border px-4 py-3 font-mono text-xs uppercase tracking-widest last:border-b-0",
                    isActive
                      ? "bg-surface text-accent"
                      : "text-text-muted hover:bg-surface hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

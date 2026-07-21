"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`block h-[1.5px] w-5 bg-[var(--color-ink)] transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
        />
        <span
          className={`block h-[1.5px] w-5 bg-[var(--color-ink)] transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
        />
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[65px] bottom-0 z-40 overflow-y-auto bg-[var(--surface-canvas)] px-6 py-8">
          <nav className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-2xl text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore, getCartTotals } from "@/lib/cart-store";
import { CATALOGUE } from "@/lib/catalogue";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const { subtotalPence } = getCartTotals(lines);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-[var(--color-on-inverted)]"
      >
        Cart{itemCount > 0 ? ` (${itemCount})` : ""}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[var(--surface-inverted)]/60"
          />

          <div className="relative flex h-full w-full max-w-sm flex-col bg-[var(--surface-canvas)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl">Your cart</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--color-muted)]">
                Close
              </button>
            </div>

            {lines.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Your cart is empty.</p>
            ) : (
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                {lines.map((line) => {
                  const item = CATALOGUE[line.id];
                  if (!item) return null;
                  return (
                    <div key={line.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{item.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">£{(item.price / 100).toFixed(2)} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.id, line.quantity - 1)}
                            className="h-7 w-7 rounded-full border border-[var(--color-border)] text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.id, line.quantity + 1)}
                            className="h-7 w-7 rounded-full border border-[var(--color-border)] text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="text-xs font-semibold text-[var(--color-rouge)]"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <div className="mb-4 flex items-center justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>£{(subtotalPence / 100).toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                aria-disabled={lines.length === 0}
                className={`block w-full rounded-[var(--radius-pill)] px-6 py-3 text-center font-semibold text-[var(--color-on-inverted)] ${
                  lines.length === 0 ? "pointer-events-none bg-[var(--color-muted)]" : "bg-[var(--color-ink)]"
                }`}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

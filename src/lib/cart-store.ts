"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CATALOGUE } from "@/lib/catalogue";

type CartLine = { id: string; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (id: string, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (id, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.id === id);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.id === id ? { ...line, quantity: line.quantity + quantity } : line
              ),
            };
          }
          return { lines: [...state.lines, { id, quantity }] };
        }),
      remove: (id) => set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.id !== id)
              : state.lines.map((line) => (line.id === id ? { ...line, quantity } : line)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "leemah-cart" }
  )
);

export function getCartTotals(lines: CartLine[]) {
  let totalJars = 0;
  let subtotalPence = 0;

  for (const line of lines) {
    const item = CATALOGUE[line.id];
    if (!item) continue;
    totalJars += item.jarCount * line.quantity;
    subtotalPence += item.price * line.quantity;
  }

  return { totalJars, subtotalPence };
}

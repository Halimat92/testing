"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({ id }: { id: string }) {
  const add = useCartStore((state) => state.add);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        add(id, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="rounded-[var(--radius-pill)] bg-[var(--color-on-inverted)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition-opacity hover:opacity-90"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}

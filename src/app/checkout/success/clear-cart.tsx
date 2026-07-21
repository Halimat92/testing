"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

// Clears the cart once, on the confirmed success page. Rendered only after
// the session has been verified as paid server-side.
export function ClearCart() {
  const clear = useCartStore((state) => state.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}

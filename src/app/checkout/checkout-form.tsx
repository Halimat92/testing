"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCartStore, getCartTotals } from "@/lib/cart-store";
import { CATALOGUE, getDeliveryAmount } from "@/lib/catalogue";

export function CheckoutForm() {
  const lines = useCartStore((state) => state.lines);
  const { totalJars, subtotalPence } = getCartTotals(lines);

  const [fulfilmentOption, setFulfilmentOption] = useState<"pickup" | "delivery">("pickup");
  const [allergenAcknowledged, setAllergenAcknowledged] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const deliveryAmount = getDeliveryAmount(fulfilmentOption, totalJars);
  const estimatedTotal = subtotalPence + deliveryAmount;

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-[var(--color-body)]">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-6 py-3 font-semibold text-[var(--color-on-inverted)]"
        >
          Shop the jars
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (totalJars < 2) {
      setError("Minimum order is 2 jars.");
      return;
    }

    if (!allergenAcknowledged) {
      setError("Please confirm that you have checked the allergen information before ordering.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const customer = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      postcode: String(formData.get("postcode") || ""),
    };

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines,
          fulfilmentOption,
          customer,
          allergenAcknowledged,
          couponCode: couponCode || undefined,
          orderNote: orderNote || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Checkout could not be created.");
        setLoading(false);
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("Checkout could not be created. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg">Your details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder="Full name" aria-label="Full name" autoComplete="name" className="input-field sm:col-span-2" />
            <input name="email" type="email" required placeholder="Email" aria-label="Email" autoComplete="email" className="input-field" />
            <input name="phone" type="tel" required placeholder="Phone" aria-label="Phone" autoComplete="tel" className="input-field" />
          </div>
        </div>

        <div>
          <h2 className="text-lg">Fulfilment</h2>
          <div className="mt-3 flex gap-3">
            {(["pickup", "delivery"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={fulfilmentOption === option}
                onClick={() => setFulfilmentOption(option)}
                className={`inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border-[1.5px] px-5 text-sm font-semibold capitalize ${
                  fulfilmentOption === option
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-on-inverted)]"
                    : "border-[var(--color-border)] text-[var(--color-body)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {fulfilmentOption === "delivery" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="address" required placeholder="Delivery address" aria-label="Delivery address" autoComplete="street-address" className="input-field sm:col-span-2" />
            <input name="city" required placeholder="City" aria-label="City" autoComplete="address-level2" className="input-field" />
            <input name="postcode" required placeholder="Postcode" aria-label="Postcode" autoComplete="postal-code" className="input-field" />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-semibold text-[var(--color-body)]">
            Order note (optional)
          </label>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            maxLength={450}
            rows={3}
            className="input-field w-full"
            placeholder="Anything we should know about your order?"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[var(--color-body)]">
            Coupon code (optional)
          </label>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="input-field"
            placeholder="e.g. LEEMAH5"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-[var(--color-body)]">
          <input
            type="checkbox"
            checked={allergenAcknowledged}
            onChange={(e) => setAllergenAcknowledged(e.target.checked)}
            className="mt-1"
          />
          I confirm I have checked the allergen information before placing this order.
        </label>

        {error ? <p role="alert" className="text-sm text-[var(--color-rouge)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[var(--radius-pill)] bg-[var(--color-rouge)] px-7 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Redirecting to payment..." : "Continue to payment"}
        </button>
      </form>

      <aside className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-6">
        <h2 className="text-lg">Order summary</h2>
        <div className="mt-4 flex flex-col gap-3">
          {lines.map((line) => {
            const item = CATALOGUE[line.id];
            if (!item) return null;
            return (
              <div key={line.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-body)]">
                  {line.quantity} × {item.name}
                </span>
                <span className="font-semibold text-[var(--color-ink)]">
                  £{((item.price * line.quantity) / 100).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-sm">
          <span>Subtotal</span>
          <span>£{(subtotalPence / 100).toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>Delivery</span>
          <span>{deliveryAmount > 0 ? `£${(deliveryAmount / 100).toFixed(2)}` : "Free"}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4 font-semibold">
          <span>Estimated total</span>
          <span>£{(estimatedTotal / 100).toFixed(2)}</span>
        </div>
        {totalJars < 2 ? (
          <p className="mt-3 text-xs text-[var(--color-rouge)]">Minimum order is 2 jars.</p>
        ) : null}
      </aside>
    </div>
  );
}

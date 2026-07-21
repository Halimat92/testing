"use client";

import { useState, type FormEvent } from "react";

type TimelineStep = { status: string; label: string; at: string | null; complete: boolean };
type OrderResult = {
  orderNumber: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  fulfilment: string;
  orderSummary: string;
  totalJars: number;
  timeline: TimelineStep[];
};

export function TrackOrderForm() {
  const [reference, setReference] = useState("");
  const [lookup, setLookup] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, lookup }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "We could not find that order.");
        return;
      }

      setOrder(payload.order);
    } catch {
      setError("Order tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm font-semibold text-[var(--color-body)]">Order number</span>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="LCM-1234ABCD"
            required
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--surface-card)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-rouge)]"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-sm font-semibold text-[var(--color-body)]">Email or phone</span>
          <input
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="you@email.com or phone number"
            required
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--surface-card)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-rouge)]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-7 py-3 font-semibold text-[var(--color-on-inverted)] disabled:opacity-60"
        >
          {loading ? "Checking..." : "Track order"}
        </button>
      </form>

      {error ? <p className="mt-6 text-sm text-[var(--color-rouge)]">{error}</p> : null}

      {order ? (
        <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl">{order.orderNumber}</h2>
            <span className="rounded-[var(--radius-pill)] bg-[var(--surface-raised)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink)]">
              {order.statusLabel}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[var(--color-muted)]">Fulfilment</dt>
              <dd className="text-[var(--color-ink)]">{order.fulfilment || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Total jars</dt>
              <dd className="text-[var(--color-ink)]">{order.totalJars}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Last updated</dt>
              <dd className="text-[var(--color-ink)]">
                {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString("en-GB") : "Waiting for update"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-[var(--color-body)]">{order.orderSummary}</p>

          {order.timeline?.length ? (
            <ol className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6">
              {order.timeline.map((step) => (
                <li key={step.status} className="flex items-center gap-3 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${step.complete ? "bg-[var(--color-rouge)]" : "bg-[var(--color-border)]"}`}
                  />
                  <span className={step.complete ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

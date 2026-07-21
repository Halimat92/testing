import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { TrackOrderForm } from "./track-order-form";

export const metadata: Metadata = {
  title: "Track Your Order | Leemah Cakes N More",
  description: "See where your Leemah Cakes N More order is.",
};

export default function TrackOrderPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[720px] px-6 py-16 md:py-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Order tracking
          </p>
          <h1 className="text-4xl md:text-5xl">
            See where your <span className="italic text-[var(--color-rouge)]">order is.</span>
          </h1>
          <p className="mt-5 text-[var(--color-body)]">
            Enter your order number and the email or phone number used at checkout. We only show the order
            progress, not private payment details.
          </p>

          <div className="mt-10">
            <TrackOrderForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

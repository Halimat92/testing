import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = {
  title: "Thank You | Leemah Cakes N More",
  description: "Your Leemah Cakes N More order has been received.",
};

function getOrderNumber(sessionId: string): string {
  const cleanId = sessionId.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const suffix = cleanId.slice(-8);
  return suffix ? `LCM-${suffix}` : "";
}

/**
 * Verify the session with Stripe server-side. A success page keyed purely on
 * a URL param is forgeable — anyone visiting /checkout/success?session_id=cs_x
 * would see "confirmed". We only confirm sessions Stripe reports as paid.
 */
async function verifyPaidSession(sessionId: string | undefined): Promise<string | null> {
  if (!sessionId || !sessionId.startsWith("cs_") || !process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return getOrderNumber(session.id);
    }
    return null;
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const orderNumber = await verifyPaidSession(sessionId);
  const confirmed = orderNumber !== null;

  return (
    <>
      <Nav />
      {confirmed ? <ClearCart /> : null}

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            {confirmed ? (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                  Order confirmed
                </p>
                <h1 className="text-4xl md:text-5xl">
                  Thank you for your <span className="italic text-[var(--color-rouge)]">order.</span>
                </h1>
                <p className="mt-5 max-w-md text-[var(--color-body)]">
                  Your order has been received by Leemah Cakes N More. Use your order number to track the
                  progress.
                </p>
                <p className="mt-6 inline-block rounded-[var(--radius-pill)] bg-[var(--surface-raised)] px-5 py-2 font-semibold text-[var(--color-ink)]">
                  Order number: {orderNumber}
                </p>
              </>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                  Order status
                </p>
                <h1 className="text-4xl md:text-5xl">
                  We couldn&apos;t <span className="italic text-[var(--color-rouge)]">confirm this order.</span>
                </h1>
                <p className="mt-5 max-w-md text-[var(--color-body)]">
                  If you&apos;ve just paid, your confirmation may take a moment — try the tracking page with
                  your order number and email. If you were charged but can&apos;t find your order, please get
                  in touch and we&apos;ll sort it out.
                </p>
              </>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-6 py-3 font-semibold text-[var(--color-on-inverted)]"
              >
                Continue shopping
              </Link>
              <Link
                href="/track-order"
                className="rounded-[var(--radius-pill)] border-[1.5px] border-[var(--color-ink)] px-6 py-3 font-semibold text-[var(--color-ink)]"
              >
                Track order
              </Link>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-6">
              <h2 className="text-lg">Track your order</h2>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[var(--color-body)]">
                <li>Keep your order number safe.</li>
                <li>Open the tracking page to see the latest status.</li>
                <li>Use the same email or phone number entered at checkout.</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-6">
              <h2 className="text-lg">Order note</h2>
              <p className="mt-3 text-sm text-[var(--color-body)]">
                Orders are prepared fresh. Cancellations requested more than 6 hours after placing your
                order are non-refundable.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}

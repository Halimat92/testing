import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { REVIEWS } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Customer Reviews | Leemah Cakes N More",
  description: "Sweet words from customers who've ordered Leemah Cakes N More dessert jars.",
};

function Stars({ count }: { count: number }) {
  return (
    <span aria-hidden className="text-[var(--color-gold)]">
      {"★".repeat(count)}
      {"☆".repeat(5 - count)}
    </span>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Customer love
          </p>
          <h1 className="text-4xl md:text-5xl">
            Sweet words from <span className="italic text-[var(--color-rouge)]">customers.</span>
          </h1>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {REVIEWS.map((review) => (
              <figure
                key={review.name}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-6"
              >
                <Stars count={review.rating} />
                <blockquote className="mt-4 text-[var(--color-body)]">&ldquo;{review.quote}&rdquo;</blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-[var(--color-ink)]">{review.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{review.flavours}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

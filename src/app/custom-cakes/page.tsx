import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CUSTOM_CAKE_OCCASIONS, SITE } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Custom Cakes | Leemah Cakes N More",
  description: "Custom celebration cakes made for your moment, starting from £75.",
};

export default function CustomCakesPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
          <h1 className="max-w-2xl text-4xl leading-tight md:text-6xl">
            Celebration cakes made for <span className="italic text-[var(--color-rouge)]">your moment.</span>
          </h1>

          <p className="mt-6 inline-block rounded-[var(--radius-pill)] bg-[var(--surface-raised)] px-4 py-1.5 text-sm font-semibold text-[var(--color-ink)]">
            Starting from £{(SITE.customCakeStartingPricePence / 100).toFixed(0)}
          </p>

          <p className="mt-6 max-w-xl text-[var(--color-body)]">
            Final pricing depends on size, flavour, filling, finish, decoration and collection or delivery
            details. Share your date, serving size, theme, colour palette and inspiration photos so we can
            price the cake properly.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {CUSTOM_CAKE_OCCASIONS.map((occasion) => (
              <span
                key={occasion}
                className="rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-body)]"
              >
                {occasion}
              </span>
            ))}
          </div>

          <a
            href={SITE.customCakeQuoteFormHref}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-7 py-3 font-semibold text-[var(--color-on-inverted)]"
          >
            Get a quote in 2 minutes
          </a>
        </section>

        <section className="border-t border-[var(--color-border)] bg-[var(--surface-raised)]">
          <div className="mx-auto max-w-[1280px] px-6 py-16">
            <h2 className="text-2xl">Need design ideas?</h2>
            <p className="mt-3 max-w-xl text-[var(--color-body)]">
              Browse recent cake designs, colours and finishes. When you request a quote, include your date,
              serving size, theme and any inspiration photos you already have.
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-[var(--color-rouge)]">
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                View Instagram designs →
              </a>
              <a href={SITE.tiktok} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                Watch cake videos →
              </a>
              <Link href="/celebration-cakes" className="underline underline-offset-4">
                See the celebration cake gallery →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "About | Leemah Cakes N More",
  description: "Learn about Leemah Cakes N More, pickup, delivery and freshly made dessert jars in Chelmsford.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src="/images/baker.jpg"
              alt="Leemah, founder of Leemah Cakes N More"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              {SITE.location}
            </p>
            <h1 className="text-4xl md:text-5xl">
              Hi, I&apos;m <span className="italic text-[var(--color-rouge)]">Leemah.</span>
            </h1>
            <div className="mt-6 flex flex-col gap-4 text-[var(--color-body)]">
              <p>
                I&apos;m a Chelmsford-based baker with a deep love for creating desserts that bring joy to
                people. What started as a passion for baking for family and friends has grown into Leemah
                Cakes N More.
              </p>
              <p>
                Every jar is made fresh by hand with real ingredients and a lot of love. I believe that
                everyone deserves a little indulgence, and I want every bite to feel like a special moment.
              </p>
              <p>
                Whether you are treating yourself, gifting someone special or ordering for an event, I put
                the same care and attention into every single order.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] bg-[var(--surface-raised)]">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-16 sm:grid-cols-3">
            <div>
              <h2 className="text-lg">Delivery</h2>
              <p className="mt-2 text-sm text-[var(--color-body)]">Delivery is available at checkout.</p>
            </div>
            <div>
              <h2 className="text-lg">Pickup</h2>
              <p className="mt-2 text-sm text-[var(--color-body)]">Pickup is available at checkout.</p>
            </div>
            <div>
              <h2 className="text-lg">Local collection</h2>
              <p className="mt-2 text-sm text-[var(--color-body)]">
                Free collection from Chelmsford. You&apos;ll receive a collection update after ordering.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

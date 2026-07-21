import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Celebration Cake Inspiration | Leemah Cakes N More",
  description: "Browse a small curated gallery of celebration cakes, then request a quote for a similar style.",
};

const GALLERY = [
  { src: "/images/celebration-cakes/floral.PNG", alt: "Floral celebration cake by Leemah Cakes N More" },
  { src: "/images/celebration-cakes/t-and-m.PNG", alt: "Personalised celebration cake by Leemah Cakes N More" },
  { src: "/images/celebration-cakes/tall.PNG", alt: "Tall celebration cake by Leemah Cakes N More" },
  { src: "/images/celebration-cakes/tara.jpeg", alt: "Luxury celebration cake by Leemah Cakes N More" },
];

export default function CelebrationCakesPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Celebration cake inspiration
          </p>
          <h1 className="max-w-2xl text-4xl leading-tight md:text-5xl">
            Recent cakes for <span className="italic text-[var(--color-rouge)]">beautiful moments.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[var(--color-body)]">
            Browse a small curated gallery of celebration cakes, then request a quote for a similar style
            with your date, size, flavour and theme.
          </p>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 pb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {GALLERY.map((image) => (
              <div key={image.src} className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <a
            href={SITE.customCakeQuoteFormHref}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-7 py-3 font-semibold text-[var(--color-on-inverted)]"
          >
            Get a quote for a similar cake
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CATALOGUE } from "@/lib/catalogue";

const FEATURED_IDS = ["red-velvet", "cookies-cream-noir", "strawberry-bliss"];
const BUNDLE_IDS = ["bundle-trio", "bundle-four", "bundle-five"];

export default function HomePage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="relative h-[640px] w-full overflow-hidden md:h-[720px]">
          <Image
            src="/images/hompage.PNG"
            alt="A gift box of Leemah Cakes N More dessert jars, ribboned and ready to send"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-inverted)]/90 via-[var(--surface-inverted)]/10 to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col justify-end px-6 pb-16">
            <h1 className="max-w-2xl text-5xl leading-[1.05] text-[var(--color-on-inverted)] md:text-7xl">
              Cake, layered
              <br />
              <span className="italic text-[var(--color-rouge)]">jar by jar.</span>
            </h1>
            <p className="mt-6 max-w-md text-[var(--color-on-inverted)]/85">
              Small-batch dessert jars, baked and finished by hand the day they&apos;re made —
              nothing shipped from a mix.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="rounded-[var(--radius-pill)] bg-[var(--color-on-inverted)] px-7 py-3 font-semibold text-[var(--color-ink)]"
              >
                Shop the jars
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold text-[var(--color-on-inverted)] underline underline-offset-4"
              >
                Meet Leemah
              </Link>
            </div>
          </div>
        </section>

        <div className="border-y border-[var(--color-border)] bg-[var(--surface-raised)]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-3 gap-y-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            <span>Made fresh to order</span>
            <span aria-hidden className="h-3 w-px bg-[var(--color-border)]" />
            <span>Delivered across the UK</span>
            <span aria-hidden className="h-3 w-px bg-[var(--color-border)]" />
            <span>Minimum order 2 jars</span>
          </div>
        </div>

        <section className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl">Best sellers</h2>
            <Link href="/shop" className="text-sm font-semibold text-[var(--color-rouge)]">
              View all jars →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {FEATURED_IDS.map((id, i) => (
              <ProductCard key={id} id={id} item={CATALOGUE[id]} index={i + 1} />
            ))}
          </div>
        </section>

        <section className="bg-[var(--surface-raised)] py-16">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-3xl">Bundles for gifting</h2>
              <Link href="/shop" className="text-sm font-semibold text-[var(--color-rouge)]">
                View all bundles →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {BUNDLE_IDS.map((id) => (
                <ProductCard key={id} id={id} item={CATALOGUE[id]} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-14">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
              <Image src="/images/baker.jpg" alt="Leemah, founder of Leemah Cakes N More" fill className="object-cover" />
            </div>
            <p className="text-lg text-[var(--color-body)]">
              &ldquo;Every jar is made fresh to order, in small batches, from my kitchen to your
              door — no shortcuts, no mixes.&rdquo;
              <span className="ml-2 text-sm font-semibold text-[var(--color-muted)]">
                — Leemah,{" "}
                <Link href="/about" className="text-[var(--color-rouge)]">
                  more about us →
                </Link>
              </span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

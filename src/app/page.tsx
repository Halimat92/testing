import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CATALOGUE } from "@/lib/catalogue";

const FEATURED_IDS = ["red-velvet", "cookies-cream-noir", "strawberry-bliss"];

export default function HomePage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-rouge)]">
              Handmade to order · Delivered across the UK
            </p>
            <h1 className="text-4xl italic leading-tight md:text-5xl">
              Dessert jars, layered with care.
            </h1>
            <p className="mt-5 max-w-md text-base text-[var(--color-body)]">
              Small-batch cakes in a jar, baked fresh and finished by hand — perfect for gifting,
              sharing, or keeping entirely to yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-[var(--radius-pill)] bg-[var(--color-rouge)] px-6 py-3 font-semibold text-white"
              >
                Shop dessert jars
              </Link>
              <Link
                href="/custom-cakes"
                className="rounded-[var(--radius-pill)] border-[1.5px] border-[var(--color-ink)] px-6 py-3 font-semibold text-[var(--color-ink)]"
              >
                Enquire about a custom cake
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src="/images/hompage.PNG"
              alt="A gift box of Leemah Cakes N More dessert jars"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl">Best sellers</h2>
            <Link href="/shop" className="text-sm font-semibold text-[var(--color-rouge)]">
              View all jars →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {FEATURED_IDS.map((id) => (
              <ProductCard key={id} item={CATALOGUE[id]} />
            ))}
          </div>
        </section>

        <section className="bg-[var(--surface-raised)]">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] md:order-2">
              <Image
                src="/images/baker.jpg"
                alt="Leemah, founder of Leemah Cakes N More"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl">Hi, I&apos;m Leemah</h2>
              <p className="mt-4 text-[var(--color-body)]">
                Every jar is made fresh to order, in small batches, from my kitchen to your door.
                No shortcuts, no mixes — just cake layered the way I&apos;d want to eat it.
              </p>
              <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-[var(--color-rouge)]">
                More about Leemah Cakes N More →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

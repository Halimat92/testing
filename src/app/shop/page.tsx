import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CATALOGUE } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop Dessert Jars | Leemah Cakes N More",
  description: "Small-batch dessert jars and bundles, handmade to order and delivered fresh across the UK.",
};

export default function ShopPage() {
  const entries = Object.entries(CATALOGUE);

  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-6 py-12">
          <h1 className="text-4xl">Dessert Jars</h1>
          <p className="mt-3 max-w-xl text-[var(--color-body)]">
            Every jar is layered and finished by hand the day it&apos;s made. Minimum order is 2 jars —
            mix and match, or pick a bundle below.
          </p>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {entries.map(([id, item]) => (
              <ProductCard key={id} id={id} item={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--surface-inverted)] text-[var(--color-on-inverted)]">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--color-on-inverted)]">Leemah Cakes N More</h2>
            <p className="mt-3 max-w-xs text-sm opacity-80">
              Small-batch dessert jars and celebration cakes, handmade to order and delivered fresh across the UK.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-on-inverted)] opacity-70">Shop</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/shop">Dessert Jars</Link></li>
              <li><Link href="/custom-cakes">Custom Cakes</Link></li>
              <li><Link href="/celebration-cakes">Celebration Cakes</Link></li>
              <li><Link href="/track-order">Track an Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-on-inverted)] opacity-70">Company</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/reviews">Reviews</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-xs opacity-60">
          © {new Date().getFullYear()} Leemah Cakes N More. All prices in GBP. Made fresh to order in the UK.
        </p>
      </div>
    </footer>
  );
}

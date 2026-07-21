import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/mobile-nav";
import { CartDrawer } from "@/components/cart-drawer";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-cakes", label: "Custom Cakes" },
  { href: "/celebration-cakes", label: "Celebration Cakes" },
  { href: "/about", label: "About" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--surface-card)]/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.jpeg"
            alt="Leemah Cakes N More"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-display text-lg text-[var(--color-ink)]">Leemah Cakes N More</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[var(--color-body)] hover:text-[var(--color-rouge)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartDrawer />
          <MobileNav links={LINKS} />
        </div>
      </div>
    </header>
  );
}

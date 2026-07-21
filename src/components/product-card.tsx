import Image from "next/image";
import type { CatalogueItem } from "@/lib/catalogue";

export function ProductCard({ item }: { item: CatalogueItem }) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-raised)]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg">{item.name}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
        <p className="mt-3 font-sans text-lg font-bold text-[var(--color-rouge)]">
          £{(item.price / 100).toFixed(2)}
        </p>
      </div>
    </article>
  );
}

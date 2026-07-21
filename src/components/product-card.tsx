import Image from "next/image";
import type { CatalogueItem } from "@/lib/catalogue";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({ id, item, index }: { id: string; item: CatalogueItem; index?: number }) {
  return (
    <article className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-raised)]">
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-inverted)]/90 via-[var(--surface-inverted)]/10 to-transparent" />

      {typeof index === "number" ? (
        <span className="absolute left-4 top-4 text-xs font-semibold tracking-widest text-[var(--color-on-inverted)]/70">
          {String(index).padStart(2, "0")}
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-[var(--color-on-inverted)]/70">
            {item.jarCount > 1 ? `Bundle · ${item.jarCount} jars` : "Dessert jar"}
          </p>
          <h3 className="mt-1 text-xl text-[var(--color-on-inverted)]">
            {item.name.replace(" Dessert Jar", "")}
          </h3>
          <p className="mt-2 text-sm font-semibold text-[var(--color-on-inverted)]">
            £{(item.price / 100).toFixed(2)}
          </p>
        </div>
        <AddToCartButton id={id} />
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Contact | Leemah Cakes N More",
  description: "Contact Leemah Cakes N More for dessert jar orders, delivery questions and custom cake enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
          <h1 className="max-w-xl text-4xl md:text-5xl">
            Have a question? <span className="italic text-[var(--color-rouge)]">Ask away.</span>
          </h1>
          <p className="mt-5 max-w-md text-[var(--color-body)]">
            You can ask about availability, orders, delivery, flavours, custom cakes or anything else.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-7 font-semibold text-[var(--color-on-inverted)]"
            >
              Email us
            </a>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--color-rouge)] underline underline-offset-4"
            >
              Or message us on WhatsApp →
            </a>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] bg-[var(--surface-raised)]">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Email</h2>
              <p className="mt-2 text-sm text-[var(--color-ink)]">{SITE.email}</p>
            </div>
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">WhatsApp</h2>
              <p className="mt-2 text-sm text-[var(--color-ink)]">{SITE.whatsapp}</p>
            </div>
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Location</h2>
              <p className="mt-2 text-sm text-[var(--color-ink)]">{SITE.location}</p>
            </div>
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Follow</h2>
              <p className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-ink)]">
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Instagram
                </a>
                <a href={SITE.tiktok} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  TikTok
                </a>
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-[1280px] px-6 pb-16">
            <a
              href={SITE.hygieneRatingHref}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--color-rouge)] underline underline-offset-4"
            >
              5-star food hygiene rating — verify on the Food Standards Agency site →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

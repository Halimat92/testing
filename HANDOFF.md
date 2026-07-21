# Leemah Cakes N More — Handoff & Audit

Read this first if you're picking up this project cold (human or AI agent). It's the current-state
snapshot; `PROGRESS_LOG.md` next to this file has the chronological history of *how* we got here and
*why* specific decisions were made — read that too if you need the reasoning, not just the state.

## What this is

Migrating Leemah Cakes N More (a Chelmsford, UK dessert-jar/celebration-cake business) from a static
HTML site (Netlify Functions + Stripe + Netlify Blobs, archived at `legacy-static/`) to a Next.js app on
Vercel, backed by Supabase. Working branch: **`vercel-nextjs-migration`**, pushed to
`origin` (github.com/Halimat92/testing) — not merged to `main` yet, `main` is still the old static site.
`SETUP.md` at repo root is the non-technical guide for the business owner to connect her own Supabase,
Stripe, and Vercel accounts — send her that file, not this one.

## Tech stack (verify against package.json — Next.js ships breaking changes fast)

- Next.js **16.2.10**, App Router, Turbopack, React **19.2.4**, TypeScript, Tailwind **v4**
- Next 16 renamed `middleware.ts` → **`proxy.ts`** (`proxy()` export, `proxyConfig` not `config`) — this
  repo already uses the new name. Don't reintroduce `middleware.ts`.
- Fonts: `next/font/google` — **Newsreader** (display/headings) + **Manrope** (body/UI), set up in
  `src/lib/fonts.ts`. (Originally Fraunces + Inter; changed after user feedback that Fraunces reads as a
  very recognisable "AI website builder" default — see `PROGRESS_LOG.md`.)
- Supabase: `@supabase/supabase-js` + `@supabase/ssr`. Three client entry points, each with a distinct
  purpose — don't collapse them:
  - `src/lib/supabase/admin.ts` — service-role, RLS-bypassing, server-only, **lazily constructed** (so a
    missing env var fails the one request that needs it, not `next build`).
  - `src/lib/supabase/server.ts` — cookie-aware, respects RLS, for auth checks in Server
    Components/Actions.
  - `src/lib/supabase/browser.ts` — client-side, auth only (never query product/order data directly from
    the browser).
- Stripe: `stripe` SDK, hosted Checkout (redirect flow, not Elements/inline) — deliberately kept from the
  legacy site because it hands you Apple/Google Pay and PCI scope for free.

## What's actually built

**Storefront pages** (all in `src/app/`): `/` (home), `/shop`, `/about`, `/custom-cakes`,
`/celebration-cakes`, `/contact`, `/reviews`, `/track-order`, `/checkout/success`. All use real content
pulled from the legacy site (`src/lib/site-info.ts` centralises brand facts: Chelmsford location, real
WhatsApp/Instagram/TikTok, FSA hygiene rating link, the 3 real customer testimonials) — not invented copy.

**API / money path** (`src/app/api/`):
- `checkout/route.ts` — builds a Stripe Checkout session from the hardcoded `CATALOGUE`
  (`src/lib/catalogue.ts`, 8 SKUs), re-validates price/stock server-side, handles coupons
  (`src/lib/coupons.ts`, checks redemption counts against the `coupon_redemptions` Supabase table).
- `stripe/webhook/route.ts` — verifies signature, is idempotent (upsert on `stripe_session_id` unique
  constraint), writes the `orders` row.
- `orders/track/route.ts` — public order lookup by order number/session ID + email/phone match. Has a
  `TODO` for rate limiting (no KV/Redis provisioned yet).

**Database**: `supabase/migrations/0001_init.sql` — `orders` + `coupon_redemptions` tables, RLS enabled
with **no policies** (everything goes through the service-role client, by design). A real Supabase project
now exists; the migration has been applied and the `orders` table was reached successfully with the
service-role client on 2026-07-21. Local credentials live only in gitignored `.env.local`.

**Admin**: `/admin/login` (Supabase Auth email/password) + `/admin/orders` (list + status-update Server
Action), gated by `proxy.ts`. This replaces the legacy site's shared-secret-token approach
(`LEEMAH_ADMIN_TOKEN`) with real per-user auth.

**Design system**: `DESIGN.md` at repo root — read it before touching any styling. Token summary: one
chromatic accent (`--color-rouge`, used sparingly — CTAs/prices/small accents only, NOT the dominant
color), gold as a metallic accent only, warm cream canvas, Newsreader + Manrope, full pill buttons,
16px card radius, named surface hierarchy (canvas/card/raised/inverted), borders over shadows.

## Cart + checkout flow — now built

`src/lib/cart-store.ts` (Zustand, `persist`-backed to localStorage) + `src/components/add-to-cart-button.tsx`
+ `src/components/cart-drawer.tsx` (in the nav, replaced the old static "Order now" pill) + `/checkout`
page (`src/app/checkout/checkout-form.tsx`) collecting name/email/phone/fulfilment/address/allergen
acknowledgment/coupon, calling `/api/checkout`, redirecting to the returned Stripe session URL.
Functionally verified via DOM inspection (add to cart, drawer quantity/remove, checkout page order-summary
math, delivery-fee toggle) — not yet verified through an actual live Stripe payment, since no Stripe keys
are configured yet (see Blockers below).

## Other known gaps, roughly in priority order

1. **Supabase exists and is connected locally, but the full money path is not tested yet** — the
   migration is applied, the empty `orders` table is reachable, and the owner email is in the local
   `ADMIN_EMAILS` allowlist. Admin browser login, webhook order creation, tracking, and Vercel environment
   variables still need verification. No Supabase secret is committed to Git.
2. **No live/test Stripe keys wired in** — same blocker, needed alongside Supabase to test payment.
   `SETUP.md` covers this too.
3. **Not deployed to Vercel yet** — branch is pushed to GitHub (`vercel-nextjs-migration`) but no Vercel
   project has been created/linked. The owner's New Project screen shows `main`, which is Vercel's normal
   default. Remediation is complete and the branch is awaiting the controlled `main` update; do not deploy
   yet. Once the migration is merged to `main`, import the project and set the required environment
   variables, but wait for explicit approval before clicking Deploy.
4. **Natasha's Law compliance** — UK law requires full ingredient/allergen info shown *before* purchase
   for prepacked-for-direct-sale food, not just an acknowledgment checkbox (which is all the legacy site
   had, and all this rebuild has ported so far). Needs real per-flavour ingredient lists from the
   business owner before a product detail page is built properly.
5. **No cookie consent banner** — UK PECR/GDPR requirement, not yet built.
6. **No legal pages** — Terms & Conditions, Privacy Policy, a dedicated Returns/Cancellation policy page.
   The cancellation policy text exists (`SITE.cancellationPolicy` in `site-info.ts`) but isn't
   surfaced as its own page anywhere yet.
7. **No analytics** — the legacy site fired GA4 `purchase`, Meta Pixel `Purchase`, and Clarity events on
   the thank-you page. Not ported yet.
8. **No rate limiting** on the public order-tracking endpoint (flagged as a `TODO` in the route file
   itself) — needs a KV/Redis provider (Upstash via Vercel Marketplace is the natural fit) before launch.
9. **Mobile was independently rendered and the reported failures were fixed** — Codex captured every
   customer page at 375/390/768/1024 and reproduced the clipped fixed overlays and cramped product cards.
   The remediation pass moved the overlays into body-level portals, added dialog behavior, stacked narrow
   product-card controls, and moved the desktop-nav breakpoint to `lg`. The fixes were verified in-browser;
   one final real-device smoke test remains advisable before launch.
10. **Admin scope was deliberately limited** — no product CRUD (catalogue stays in `catalogue.ts` code
    for now; 8 stable SKUs don't need a CMS), no CSV import, no collections/banners, no variant system.
    These exist in the `iby_closet` reference project because it's a multi-hundred-SKU fashion catalogue
    — not applicable here. What **is** still worth adding: manual/DM order entry (Instagram/WhatsApp/phone
    orders), which the business genuinely takes and needs recorded somewhere.
11. **Logo is placeholder-quality clip art** (`public/images/logo.jpeg`) — pre-existing hand-made branding,
    not AI-generated, but visually rough (bright inconsistent colors, amateur illustration). Flagged early
    in the project for a possible professional refresh; no decision made yet, not blocking.
12. **No password or Supabase secret is committed to the repo.** The owner has created the Supabase
    project and supplied the admin email; local values are in gitignored `.env.local`. Admin login uses
    Supabase Auth, and nobody building this site should ask for or handle her password. The service-role
    key was shared through chat during setup and should be rotated before production deployment.

## Design direction — hard-won context, don't re-litigate without reading this

The design went through one real correction cycle. First pass (Fraunces + Inter, pink-forward,
symmetric hero with matched filled+outlined buttons, tiny tracked colored eyebrow) was rejected by the
user as "still looking AI-generated" — twice, actually, with a font swap as the second correction. Root
causes identified along the way (see `PROGRESS_LOG.md` for the full reasoning):
- Pink as the *dominant* color is itself the generic-AI-bakery signature for this vertical — not pink
  itself, but leading with it. Demoted to a single accent (CTAs, price, headline emphasis word) with a
  restrained ink/aubergine-near-black as the actual dominant "brand" color for buttons/nav.
- A permanent, same-position, solid-color pill button (the nav's old "Order now") is a very strong
  generic-AI tell precisely *because* it's visible on every page, all the time.
- Fraunces specifically (not serifs in general) is over-identified with AI page builders right now.
  Swapped for Newsreader, matching the pairing already validated in the `omt_advisory` sister project.
- Structural anti-generic moves that *did* work and should be preserved: full-bleed real photography
  instead of a boxed image next to text, mixed roman/italic within one headline instead of uniform
  italic, one primary CTA + a plain text link instead of a matched button pair, numbered/overlaid product
  cards instead of a white-panel-plus-paragraph card.
- Do **not** copy the *mood* of the two reference projects (`iby_closet` — monochrome streetwear;
  `omt_advisory` — dark institutional/editorial). Only their *structural* patterns transfer. This is a
  warm, indulgent food brand — going cold/minimal/austere to chase "not generic" would just be a
  different, more expensive-looking kind of generic.

## If you're an AI agent picking this up

1. Read `DESIGN.md` in full before touching any UI.
2. Read `PROGRESS_LOG.md` for the *why* behind decisions, especially the design-correction entries.
3. Append a new timestamped entry to `PROGRESS_LOG.md` when you finish a work session — that's the
   mechanism keeping this handoff current across multiple agents/sessions.
4. Don't restart the design direction from scratch because you have a different aesthetic opinion — the
   user has corrected this once already and it cost real rework. If you think the direction is wrong,
   say so explicitly and ask, don't silently redo it.
5. The cart/checkout gap (above) is the actual priority. Design polish on pages that already exist is
   secondary to making the site able to take a single real order end to end.

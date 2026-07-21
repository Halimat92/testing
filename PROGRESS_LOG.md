# Progress Log

Append-only. Newest entry at the bottom. One entry per work session — when you finish a session, add a
new entry rather than editing old ones (old entries are historical record, even if a later decision
supersedes them). No precise clock timestamps were available in this environment beyond the calendar
date, so entries are dated and numbered per session rather than clock-timed; add real times if your
environment gives you them.

Read `HANDOFF.md` first for the current-state snapshot — this file is the *history and reasoning* behind
how that state came to be.

---

## 2026-07-21 — Session 1: Repo setup, research, initial Next.js scaffold

- Cloned the existing static site (`Halimat92/testing` on GitHub) into this directory, moved it to
  `legacy-static/` for reference, created the `vercel-nextjs-migration` branch.
- Explored two reference projects the business owner's sibling had built previously:
  `C:\Users\olaji\Desktop\project\iby_closet` (Next.js/Supabase/Paystack fashion e-commerce site with a
  full admin panel) and `C:\Users\olaji\Desktop\project\omt_advisory` (an editorial advisory-firm site
  with a well-documented `DESIGN.md`/`DESIGN_PROMPT.md` design-system methodology).
- Key technical lessons pulled from `iby_closet`'s own progress notes (its `CLAUDE.md`): construct
  Supabase clients lazily, not at module scope, so a missing env var doesn't crash `next build`; never
  send the order-confirmation email from both the order-creation route *and* the webhook (duplicate
  emails); `useSearchParams()` needs a Suspense boundary; hard-fail signature verification if the webhook
  secret env var is missing (an empty-string secret must never silently "pass").
- Scaffolded Next.js 16.2.10 (App Router, Turbopack, Tailwind v4, TypeScript) at the repo root.
- Wrote `DESIGN.md` v1: Fraunces (display) + Inter (body), rouge/pink as the primary accent used fairly
  liberally, pill buttons, cream canvas. Grounded in the real product photography (which is genuinely
  good — marble surfaces, gold jar lids) rather than invented.
- Ported the money path from the legacy Netlify Functions to Next.js + Supabase: `/api/checkout`,
  `/api/stripe/webhook`, `/api/orders/track`, plus `supabase/migrations/0001_init.sql`
  (`orders` + `coupon_redemptions`, RLS locked to service-role-only).
- Built `/admin/login` + `/admin/orders` gated by Supabase Auth via `proxy.ts` (Next 16 renamed
  `middleware.ts` → `proxy.ts`), replacing the legacy shared-secret-token admin approach.
- Built home page + shop page against DESIGN.md v1, verified in-browser. Two real bugs found and fixed
  via actual browser testing (not just build success): a CSS cascade-layers issue where un-layered base
  styles in `globals.css` were beating Tailwind utility classes regardless of specificity (footer heading
  was invisible, dark-on-dark) — fixed by wrapping base styles in `@layer base`; and a `next/image`
  width/height-vs-CSS mismatch warning on the nav logo.

## 2026-07-21 — Session 2: First design correction

User feedback: the site "still looks all shades of AI generated" despite following the DESIGN.md
methodology. Diagnosis (via actually running `iby_closet` and `omt_advisory` locally and looking at them,
not just reading their docs): the *structure* was the problem, not just color/font discipline —

- A matched filled+outlined button pair, a tiny tracked colored eyebrow line above the headline, uniform
  italic on the whole headline, and perfect left/right symmetry are all extremely common AI-page-builder
  patterns, independent of the specific palette.
- Pink+cream+serif specifically **is** the generic-AI-bakery signature for this exact vertical — not
  because pink is wrong (it's brand-derived, from the real logo), but because it was the *dominant* color
  with no restraint.

Changes made: full-bleed hero photography instead of a boxed image beside text; headline mixing roman +
italic styles in one line instead of uniform italic; one primary CTA + a plain underlined text link
instead of two matched pill buttons; demoted rouge from dominant to single-accent, with a warm
aubergine-near-black (`--surface-inverted`/`--color-ink`) as the actual dominant "brand" fill for
buttons; product cards reworked from a white-panel-plus-paragraph layout to a photo-overlay with a
numbered tag, dropping the paragraph description.

Important process note for future sessions: **got advisor input before this rework**, which flagged the
risk of transplanting `iby_closet`/`omt_advisory`'s *mood* (monochrome streetwear; dark institutional)
rather than just their *structural* patterns — a warm food brand going cold/austere would just be a
different, more expensive-looking kind of generic. This distinction held up and should keep holding.

## 2026-07-21 — Session 3: Second correction + real content + remaining pages

User feedback: still "aish", flagged the nav's "Order now" button might be the culprit, and questioned
whether the founder (Leemah) section was too prominent relative to the cakes. Also: yet to build the
other pages.

- Confirmed via grep that the nav's "Order now" pill was still solid rouge — the one persistent,
  same-position, all-the-time-visible pink element on every single page. Very likely the dominant
  residual "AI" tell precisely because of that permanence. Changed to ink-filled.
- Fixed a real content bug: bundle product cards were labelled "Dessert jar" (copy-pasted from the single
  jars) instead of "Bundle · N jars".
- Addressed the Leemah-prominence question with a recommendation rather than a unilateral silent change:
  shrunk the founder section from a full 50/50 image block to a compact pull-quote (small circular photo
  + one line), and used the freed space for a "Bundles for gifting" product section, so product
  photography stays dominant down the page instead of competing with the founder photo.
- Extracted **real content** from `legacy-static/` (via a research subagent, not invented copy) for all
  remaining pages: founder bio, Chelmsford location, real WhatsApp/Instagram/TikTok, FSA hygiene rating
  link, the 3 real customer testimonials verbatim, the real custom-cake Google Form link and £75 starting
  price. Centralised in `src/lib/site-info.ts`.
- Built all remaining pages: `/about`, `/custom-cakes`, `/celebration-cakes`, `/contact`, `/reviews`,
  `/track-order` (+ client form wired to the existing API), `/checkout/success`.
- Deliberately did **not** build a fake contact-form backend — no email-sending infrastructure exists yet,
  so the contact page uses direct `mailto:`/WhatsApp links (which work with zero backend) rather than a
  form that would silently swallow submissions and mislead the business owner into thinking messages are
  being received.
- Encountered a stray browser tab that had navigated to the business's *real* external Google Form during
  testing (likely from clicking a "Get a quote" link) — closed it without interacting further; did not
  submit anything.

## 2026-07-21 — Session 4: Font swap, mobile nav fix, this handoff system

User feedback: still reads a bit "aish", suggested trying the font used in `iby_closet` or
`omt_advisory`; asked for a responsiveness check; asked for this comprehensive audit + a timestamped log
for other agents to pick up from.

- Checked both reference projects' actual font choices: `iby_closet` uses plain Inter (its distinctive
  look comes from huge letter-spacing/tracking on uppercase text, not a special display face);
  `omt_advisory` uses **Newsreader** (serif headlines, weight 400–430) + **Manrope** (sans body/UI).
  Swapped Leemah's fonts from Fraunces + Inter to Newsreader + Manrope — Fraunces specifically has become
  a very recognisable "AI website builder" default; Newsreader carries similar editorial weight without
  that specific tell. Updated `DESIGN.md` §3 to match.
- Responsiveness: the browser automation tool's `resize_window` reported success but did not actually
  change `window.innerWidth` (verified directly via JS — it stayed at the desktop value across three
  attempts on fresh tabs). No real mobile-viewport screenshot was obtained this session; don't trust any
  earlier claim of visual mobile verification. Did a static-analysis pass instead (grepped for fixed pixel
  widths that could force horizontal overflow — found none; all `w-[...]` usages are `max-w-[1280px]`
  caps, not fixed floors) and a manual code-level check that found one **real, confirmed** bug: the nav
  had no mobile menu at all below the `md:` breakpoint — 5 of 6 nav links (About, Custom Cakes,
  Celebration Cakes, Track Order, Contact) were completely unreachable on a phone, since the desktop link
  row was just `hidden` with nothing replacing it. Built `src/components/mobile-nav.tsx` (hamburger +
  full-screen link overlay) and wired it into `nav.tsx`. This was not visually confirmed post-fix due to
  the same tool limitation — worth a real device/emulator check before shipping.
- Wrote `HANDOFF.md` (current-state audit + prioritized gap list) and this file. Flagged the single
  biggest remaining gap clearly in `HANDOFF.md`: **there is no cart or checkout UI** — `/api/checkout`
  works but nothing calls it yet. That's the next priority over further design polish.

## 2026-07-21 — Session 5: Pushed the branch, built cart/checkout, wrote the setup guide

User caught something important: this branch had never actually been pushed to GitHub. All four prior
sessions' work existed only on the local machine — from the business owner's side, on GitHub, no side
branch was visible at all, so "work on the original repo as a side branch" hadn't actually been fulfilled
yet despite the branch existing locally. Pushed `vercel-nextjs-migration` to `origin` immediately
(`git push -u origin vercel-nextjs-migration`) — it now exists at
github.com/Halimat92/testing/tree/vercel-nextjs-migration. **Lesson: "create a branch" and "push a
branch" are not the same thing — verify `git branch -a` shows a `remotes/origin/...` entry, not just the
local branch, before claiming work is on "the repo" in any shared sense.**

Also built the cart/checkout flow flagged as the top-priority gap in the previous session:
- `src/lib/cart-store.ts` — Zustand store with `persist` (localStorage), plus a `getCartTotals` helper.
- `src/components/add-to-cart-button.tsx` on each product card, `src/components/cart-drawer.tsx` in the
  nav (replaced the static "Order now" pill — cart icon/count is more standard e-commerce UX and removes
  another static all-pages-always element).
- `/checkout` page (`src/app/checkout/checkout-form.tsx`): collects name/email/phone, fulfilment
  (pickup/delivery toggle), address fields (conditional on delivery), order note, coupon code, allergen
  acknowledgment checkbox; posts to `/api/checkout`; redirects to the returned Stripe session URL.
  Client-side minimum-2-jars and allergen-checkbox guards mirror the server-side ones in the API route
  (server-side remains the actual source of truth — client checks are just UX, not validation).
- Verified functionally via direct DOM/JS inspection rather than screenshots (the browser tool's
  screenshot capture was unreliable again this session — see below): added multiple items across two
  products, confirmed the cart drawer showed correct lines/quantities, confirmed the checkout page's order
  summary math was correct (subtotal, delivery fee toggling on when switching to delivery, total), and
  confirmed the delivery fulfilment toggle correctly revealed address fields. Could not verify an actual
  live Stripe redirect — no Stripe keys configured yet, expected until `SETUP.md` is completed.
- Wrote `SETUP.md` — a non-technical, step-by-step guide for the business owner (or whoever sets up the
  accounts) covering Supabase project creation + running the migration + creating her own admin login,
  Stripe test keys + webhook setup, and Vercel import + environment variables + redeploy. Deliberately
  has her create her own Supabase Auth login herself (Authentication → Users → Add user) rather than
  anyone else setting a password for her — nobody building this site should ever see or handle that
  credential. Updated `HANDOFF.md` to point at `SETUP.md` for the human-facing setup flow and to mark the
  cart/checkout gap as resolved.
- Browser tool reliability note for future sessions: `resize_window` and `screenshot` both had repeated
  failures this session (resize not actually changing `window.innerWidth`; screenshot timing out or
  silently returning a stale/blank capture despite the DOM being fully rendered, confirmed via direct
  `getBoundingClientRect`/`elementFromPoint` checks). When screenshots seem to show a missing image or a
  frozen page, verify against the DOM/network layer before concluding it's a real site bug — it has been
  a tool artifact every time this session, not an actual defect, whenever checked.

## 2026-07-21 18:00 WAT - Session 6: Independent full-site audit and real mobile reproduction

Audited the `vercel-nextjs-migration` branch independently after reading `HANDOFF.md`, this log, and
`DESIGN.md`. Ran a production build successfully and rendered all nine requested customer pages at
375px, 390px, 768px, and 1024px. The 36-page screenshot matrix plus focused cart/menu/checkout evidence
is in `output/playwright/audit-2026-07-21/`.

- **Confirmed mobile bug, root-caused:** the cart drawer and mobile menu use `position: fixed` while being
  rendered inside the sticky header, whose `backdrop-blur` creates their containing block. Both overlays
  are therefore constrained to the header instead of the viewport. The cart visibly collapses to a thin
  strip and its quantity controls are obscured; the menu shows only its first link. Both also lack dialog
  semantics, Escape handling, focus trapping/return, background inertness, and scroll locking.
- **Additional mobile defect:** the required two-column shop grid is present, but the product card keeps
  its title/price and Add button in one horizontal row. At 375/390px the copy and 32px-high button clip
  and crowd each other. Preserve the two-column direction; reflow the card's internal controls instead.
  The desktop nav also activates too early at exactly 768px and wraps into a crowded two-line header.
- **Checkout-summary report not reproduced on this branch:** after adding two different products through
  `/shop`, `/checkout` rendered both item names, quantities, and prices at every requested width and after
  a hard reload. The aside's `lines.map(...)` implementation and persisted cart state behaved correctly.
- **Critical payment integrity finding:** the Stripe webhook catches a failed Supabase order write and
  still returns HTTP 200. Stripe will treat the signed payment event as delivered, so a paid order can be
  permanently absent from the admin/tracking data. Only acknowledge after a durable, idempotent save.
- **High checkout-trust finding:** `/checkout/success` does not retrieve or verify the Stripe session. Any
  arbitrary `session_id` produces an "Order confirmed" page and invented order number; the persisted cart
  also remains populated after this page. Verify payment server-side and clear the cart only after a
  verified successful session.
- **High tracking-enumeration finding:** the public tracking matcher accepts `phone.endsWith(cleanValue)`
  with no minimum length, so a one-digit phone suffix can authorize an order lookup. The route has no
  application rate limit and also accepts PII in GET query parameters. Require exact normalized contact
  matching (or a deliberately sized secondary secret), rate-limit attempts, and use POST only.
- **Admin proxy is not active:** the project uses `src/app`, but `proxy.ts` is at repository root and
  exports `proxyConfig`; the Next 16 build's middleware manifest is empty. It must be `src/proxy.ts` and
  export `config`. The existing admin orders page and update Server Action do re-check the Supabase user,
  which prevents this misconfiguration from being an immediate UI bypass, but every authenticated user is
  currently treated as an admin and future `/admin/*` routes would have no perimeter protection.
- **Food-safety/launch blocker:** checkout requires confirmation that allergen information was checked,
  but no product/page supplies that information or links to it. UK distance-selling guidance requires
  allergen information before purchase and at delivery.
- **Other API hardening:** checkout prices are correctly recalculated from the server catalogue and the
  webhook signature hard-fails when its secret is missing. Remaining gaps are duplicate IDs bypassing the
  per-line quantity cap, no request/array/string bounds or endpoint rate limit, a non-atomic coupon usage
  cap that fails open on count errors, new Stripe coupon/session objects on every unauthenticated request,
  and success/cancel URLs derived from an untrusted Origin header instead of a canonical allowlist.
- **Supabase/RLS passed with caveats:** service-role code is only used server-side; the browser client is
  not querying orders/products; RLS is enabled with no anon/authenticated policies. Add `server-only`
  guards to the privileged modules. No committed credentials were found in the working tree or branch
  history; only `.env.example` appears, although `.gitignore` should ignore all `.env*` variants except
  the example file.
- **Accessibility:** measured touch targets below the 44px contract across the site (including 28px cart
  quantity buttons, 32px Add buttons, 36px Cart, 40px hamburger, and many text links). Muted text on cream
  is about 3.76:1 and is used below large-text sizes. Checkout contact/address fields are placeholder-only,
  note/coupon labels are not associated, fulfilment buttons expose no selected-state semantics, and form
  errors are not announced. Review stars have no accessible rating text.
- **DESIGN/AI-pattern audit:** the one-accent palette, named surfaces, real photography, mixed
  roman/italic headlines, and lack of resting card shadows generally hold. Drift remains in the matched
  filled+outlined contact CTAs and the success-page CTA group; repeated tiny tracked eyebrow labels on
  About/Celebration/Reviews/Track/Success; About's symmetric three-column feature-style block; and
  all-caps/font-semibold `h2`/`h3` labels inheriting Newsreader. `DESIGN.md` itself still contradicts the
  accepted Session 2/4 direction in its old product-card/rouge-button contract and its final Fraunces/Inter
  summary, so update the contract to document the approved direction rather than silently redesigning it.
- **Next.js 16 checks:** async `searchParams` and `cookies()` are awaited correctly, there is no
  `useSearchParams()` requiring Suspense, Server Actions re-check auth, no deprecated `middleware.ts`
  exists, and the production build passes. The proxy convention is the material Next 16 failure.
- No real Stripe test payment, signed webhook delivery, Supabase-backed tracking result, or authenticated
  admin workflow could be completed because this environment has no Stripe/Supabase credentials. Those
  remain mandatory pre-launch integration tests after setup.

## 2026-07-21 — Session 6: Remediating the Codex audit (Opus 4.8)

Worked through the Codex audit findings. Verified each load-bearing claim before acting, then fixed the
high-confidence issues and verified the headline one in-browser.

**Two reported bugs — root-caused to a single cause and fixed:**
- The header uses `backdrop-filter` (backdrop-blur). A `backdrop-filter` (like `transform`/`filter`)
  establishes a containing block, so the cart drawer and mobile menu — `fixed` descendants of the header
  — were positioned relative to the *header*, not the viewport. This is why the mobile nav showed only its
  first link and why the cart drawer's product rows were clipped while its subtotal survived (which the
  user had perceived as "checkout only showed the total price" — it was the broken drawer, not the
  checkout page, exactly as Codex reconciled). Fix: both overlays now render via
  `createPortal(..., document.body)`, escaping the containing block, plus Escape-to-close, scroll lock,
  and `role="dialog"`/`aria-modal`. **Verified in-browser via DOM inspection**: both overlays are now
  direct children of `document.body` (not inside `header`), cover the full viewport (top:0, height ===
  viewport), the cart shows all 4 product rows, and the mobile menu shows all 6 links.
- Product card internals now stack vertically on the narrowest widths (were crowding side-by-side in the
  2-col mobile grid). Desktop nav breakpoint moved md→lg so it no longer crowds/wraps at 768px.

**Critical/High security fixed:**
- Webhook returned HTTP 200 even when the Supabase order write failed → Stripe would stop retrying and the
  paid order would be lost forever. Now returns 500 on persistence failure so Stripe retries; also only
  fulfils `payment_status === "paid"` and additionally handles `checkout.session.async_payment_succeeded`
  for delayed payment methods.
- Success page was forgeable (any `session_id` showed "Order confirmed"). Now verifies the session with
  Stripe server-side and only confirms genuinely-paid sessions; cart is cleared only after verification.
- Order tracking enumeration: `phone.endsWith(value)` allowed a 1-digit suffix to authorise a lookup.
  Now requires a full email match or a full national phone-number match (last 10 digits). Removed the GET
  handler (it put email/phone in URLs); POST only.
- `proxy.ts` was at repo root exporting `proxyConfig` — with a `src/app` structure Next 16 requires
  `src/proxy.ts` exporting `config`, so the proxy was NOT registered (empty middleware manifest = zero
  perimeter protection on `/admin`). Moved to `src/proxy.ts` + `config`. Build now reports
  "ƒ Proxy (Middleware)" and the manifest is populated. Verified against the bundled Next 16 docs.
- Admin was "any authenticated Supabase user". Added `src/lib/admin-access.ts` — an `ADMIN_EMAILS`
  allowlist (fail-closed if unset), enforced in the proxy, the orders page, and the status Server Action.
- Checkout: duplicate product IDs are now consolidated before the per-ID quantity cap (previously
  bypassable), plus array-length and total-jars aggregate bounds. Stripe redirect origin now uses the
  configured `NEXT_PUBLIC_APP_URL`, not the client `Origin` header.
- Added security headers (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy) in
  `next.config.ts`; `server-only` guards on the privileged Supabase modules; `.gitignore` now ignores all
  `.env*` except `.env.example`.

**Design / anti-"AI look" (DESIGN.md-compliance):**
- Rewrote the stale parts of DESIGN.md (§6/§8/§9 still said Fraunces/Inter, rouge-primary-buttons, and
  white-bordered cards) to match the approved direction (Newsreader/Manrope, ink-default buttons with
  rouge reserved for the final checkout CTA, photo-overlay cards), and documented the backdrop-filter/
  portal rule so it can't regress.
- Footer + contact uppercase tracked labels were inheriting Newsreader (contract violation) — now
  `font-sans`. Broke the matched filled+outlined button pair on the contact page into one filled CTA + a
  text link. Darkened `--color-muted` (#8c7a7e → #6d5c60) to clear 4.5:1 on cream for small text.
- Accessibility: 44px touch targets on cart/nav/quantity/Add controls, aria-labels + autoComplete on
  checkout inputs, `aria-pressed` on the fulfilment toggle, `role="alert"` on the checkout error,
  screen-reader "N out of 5 stars" text on reviews, and removed the logo's doubled accessible name.

**Deferred (need a decision or external input — flagged to the user, not silently done):**
- Allergen info per product (Natasha's Law) — genuinely blocked on real ingredient data from the business
  owner; the checkout still asks for acknowledgment but there's still nothing to link to. Launch blocker.
- Coupon redemption race / fail-open — needs an atomic DB reservation (Postgres RPC), best done against
  a real Supabase instance. Left as-is with the existing count-then-insert.
- Rate limiting on tracking/checkout — still needs a KV/Redis provider (Upstash via Vercel Marketplace).
- Content Security Policy header — not added yet (needs per-page nonce work for inline styles).
- The 14MB `output/` audit-artifact folder is now gitignored (kept locally, not committed).

## 2026-07-21 21:08 WAT — Session 7: SQL repair, live Supabase connection, and Vercel handoff

- Rechecked `supabase/migrations/0001_init.sql` using an in-process PostgreSQL-compatible database. The
  original migration parsed and ran on both a fresh database and a second run; the concrete Supabase
  advisor issue was the trigger function's mutable search path rather than a SQL syntax failure.
- Updated the migration to schema-qualify `public.orders`, `public.coupon_redemptions`, their indexes,
  RLS statements, trigger, and function. Pinned `public.set_updated_at()` to `search_path = ''` to prevent
  object-shadowing warnings. Re-ran the entire migration twice successfully after the change.
- Received the business-owned Supabase project URL, public key, and service-role key. Stored them only in
  gitignored `.env.local`; no credential was added to source control, `PROGRESS_LOG.md`, or `HANDOFF.md`.
- Verified the real project over HTTPS: the server-role client reached the `orders` table successfully,
  the table currently contains zero rows, and the public client could make an RLS-filtered request.
- Added the confirmed Supabase Auth owner email to the local `ADMIN_EMAILS` allowlist. No password was
  requested or handled. Admin sign-in itself has not yet been tested in a browser.
- Confirmed that this makes the local application Supabase-connected, not the live Vercel deployment.
  Vercel has not been linked or deployed from this machine, and no Vercel account state was changed.
- Reviewed the owner's Vercel New Project screenshot. It shows `main` because Vercel selects `main` for a
  newly imported Git project by default; that pre-deployment screen does not provide the production-branch
  control. Remediation is now complete and awaiting the controlled `main` update; until `main` carries the
  migration the owner should leave that screen without clicking Deploy. Once the migration is merged to
  `main`, import the project (or point an existing one's production branch at `main`), set the required
  environment variables, and wait for explicit approval before deploying.
- Security follow-up: the service-role key was shared through WhatsApp/chat during setup. Rotate it in
  Supabase before production, then update both local `.env.local` and Vercel's sensitive environment
  variable. Never paste the replacement into repository files or progress logs.

## 2026-07-21 — Session 8: Controlled merge of the migration to `main`

Verified the completed migration and promoted it to `main` via fast-forward. No Vercel deployment.

- **Build:** `npx next build` succeeded (exit 0); output lists all 16 app routes and `ƒ Proxy
  (Middleware)`, and `.next/server/middleware.js` is emitted — confirming `src/proxy.ts` is registered.
- **Lint:** `npx eslint .` passed clean (exit 0, no findings).
- **Fix presence re-confirmed in code** (not just build success): cart + mobile-menu `createPortal`
  overlays, itemized checkout summary (`lines.map`), webhook returning HTTP 500 on persistence failure,
  server-side Stripe session verification on the success page, full email/phone tracking matcher (no
  short `endsWith`) with the GET handler removed, `isAdminEmail` allowlist enforced in the proxy + orders
  page + status action, checkout duplicate-ID consolidation and aggregate bounds, env-based Stripe
  redirect origin, security headers, and `server-only` guards. DESIGN.md direction left unchanged.
- **Documentation commit:** `f46dd3a` — "Document Supabase connection and deployment handoff". Committed
  only `HANDOFF.md` + `PROGRESS_LOG.md`, with the "remediation in progress" wording updated to
  "complete, awaiting the controlled `main` update".
- **`main` update:** fetched origin, checked out `main` (`c39ebd7`), `git pull --ff-only origin main`
  (already up to date), then `git merge --ff-only vercel-nextjs-migration` → fast-forwarded cleanly to
  `f46dd3a`. `main` and `vercel-nextjs-migration` are byte-identical. Pushed `origin main` normally
  (`c39ebd7..f46dd3a`, no force). `origin/main` now carries the complete 10-commit migration + remediation
  history.
- **Secret hygiene:** `.env.local` remained gitignored and untracked (`git ls-files .env.local` empty,
  `git check-ignore` positive); only `.env.example` is tracked. The staged documentation diff was scanned
  for Supabase URLs/JWTs/`sb_publishable_`/service-role/Stripe keys/`postgres://` — none present. No secret
  entered Git at any point.
- **Vercel:** not linked, not deployed. No Vercel account state was touched.
- **Next action for the owner:** refresh the Vercel New Project (import) page and confirm it now reads the
  updated `main` and detects Next.js (previously it showed "Application Preset: Other" because `main` was
  the legacy site). Add the required environment variables from `.env.example` (Supabase URL/keys,
  `ADMIN_EMAILS`, Stripe keys once available, `NEXT_PUBLIC_APP_URL`), but **wait for explicit approval
  before clicking Deploy.**

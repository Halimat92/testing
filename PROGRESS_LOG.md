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

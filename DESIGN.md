# Leemah Cakes N More — DESIGN.md

## Provenance

This spec was written by:
- Auditing the current live site (`legacy-static/`) to diagnose what reads as generic/AI-made: Cormorant Garamond + Outfit on a pink/blush/cream palette, decorated with radial pink glow blooms and diagonal gradients with no token discipline. The pairing and the gradients are the tell, not the color itself — pink is correct for this brand, undisciplined pink is not.
- Reviewing the actual product photography in `Images/` (`red.png`, `choco.png`, `vanilla.png`, etc.) — these are genuinely good: warm marble surfaces, soft raking studio light, gold screw-top lids, crumb debris for texture. The palette below is pulled from these photos, not invented.
- The existing logo (`Images/logo.jpeg`) — magenta/pink "LC" monogram + hand-drawn layered cake. Playful and colourful is the correct brand personality; the goal is a *disciplined* execution of that personality, not a replacement of it with minimalist beige.
- Structural methodology from `C:\Users\olaji\Desktop\project\omt_advisory\DESIGN_PROMPT.md` (the "DESIGN.md contract" format, one-accent rule, named surface hierarchy, Do's/Don'ts as the load-bearing section).
- Comparable DTC dessert brands researched directly: **Baked by Melissa** (small-format treats sold by box/multipack, product-on-flat-color photography, founder voice, occasion-based merchandising — the closest real comp for jars sold as singles/bundles) and **Sweet E's Bake Shop** (direct "cake in a jar" competitor, warm chocolate-toned palette, texture-forward photography). Starbucks' full-pill button language and warm-cream-canvas approach (via `getdesign.md`) informed the signature shape.

## 1. Visual Theme & Atmosphere

**"An indulgent, hand-finished dessert brand, shot like a product photographer took it seriously — playful colour, disciplined layout."**

Not minimalist (Milk Bar), not corporate (Nike monochrome). Warm, tactile, a little glossy — cream and marble canvas, one confident magenta accent, gold as a metallic detail (never a fill), real jar photography doing the emotional work instead of gradients doing it for free. Density is low: this is a small-batch shop with 8 SKUs, not a catalogue — let each product breathe.

## 2. Color Palette & Roles

| Token | Value | Role |
|---|---|---|
| `--color-rouge` | `#D6136C` | The one accent. CTAs, links, active nav state, price emphasis. Never a background fill larger than a button or badge. |
| `--color-rouge-deep` | `#A80E56` | Hover/pressed state for rouge elements only. |
| `--surface-canvas` | `#FBF6EF` | Page background. Warm cream, pulled from the marble/cream tones in the product photography — never stark white. |
| `--surface-card` | `#FFFFFF` | Product cards, form panels, modals. |
| `--surface-raised` | `#F3E9DD` | Subtle tinted panels — flavour filter chips, quote blocks, table zebra rows. |
| `--surface-inverted` | `#211417` | Footer, hero overlay scrim, dark section bands. Warm near-black (has a hint of the rouge in it), not pure `#000`. |
| `--color-gold` | `#B98A2E` | Metallic accent only — matches the jar lids. Icon strokes, dividers, small decorative flourishes. Never text, never a large fill, never competes with rouge in the same component. |
| `--color-ink` | `#241A1D` | Headings, primary body text on light surfaces. |
| `--color-body` | `#4A3B3F` | Paragraph text. |
| `--color-muted` | `#8C7A7E` | Captions, timestamps, helper text, placeholders. |
| `--color-border` | `#E8DCCB` | Card edges, input borders, dividers on light surfaces. |
| `--color-on-inverted` | `#F6EDE2` | Text on `--surface-inverted`. |

**Rule: one chromatic accent (rouge), one metallic accent (gold), everything else is warm neutral.** If a component needs a second "pop" color, the answer is more whitespace, not a second hue.

## 3. Typography

Two families. Originally Fraunces + Inter, changed after user feedback that Fraunces reads as *the* trendy AI-website-builder serif right now — swapped for the pairing used in a sister project (`omt_advisory`), which is more restrained and less visually "branded" as an AI default.

- **Display / headings — Newsreader** (variable, italic available). Editorial serif with real gravitas but no quirky ink-trap character — reads considered rather than trendy.
- **Body / UI — Manrope**. Clean geometric sans, slightly warmer terminals than Inter, disappears at small sizes.

| Use | Family | Size (desktop) | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Hero headline | Newsreader | 3.5–4.5rem | 500, italic for accent line | -0.01em | Sentence case, never all-caps |
| Section heading (h2) | Newsreader | 2.25rem | 500 | -0.01em | |
| Card/product title (h3) | Newsreader | 1.25rem | 500 | normal | |
| Nav / buttons / labels | Manrope | 0.9375rem | 600 | 0.01em | Sentence case; all-caps reserved for tiny tracked eyebrow labels only (e.g. "BEST SELLER" badge, 0.6875rem) |
| Body | Manrope | 1rem | 400 | normal | line-height 1.6 |
| Caption / helper | Manrope | 0.8125rem | 400 | normal | `--color-muted` |
| Price | Manrope | 1.125rem | 700 | normal | `--color-rouge` |

Weight ceiling: Newsreader stays in the 400–500 range — it's not designed as a bold display face, and pushing it heavier loses the editorial feel. Manrope carries 400/500/600/700, nothing between.

## 4. Layout & Spacing

- Base unit: **4px**. All spacing is a multiple of 4 (4, 8, 12, 16, 24, 32, 48, 64, 96).
- Max content width: **1280px**, with 24px gutters on mobile, 48px on desktop.
- Section vertical rhythm: 64px mobile / 96px desktop between major sections.
- Grid: product grid is 2-col mobile → 3-col tablet → 4-col desktop. Never more than 4 columns (these are hand-made jars, not a 500-SKU catalogue — resist the urge to cram).

## 5. Surface Hierarchy & Depth

Four named levels, depth from contrast and hairline borders — not drop shadows:

1. **Canvas** (`--surface-canvas`) — page background.
2. **Card** (`--surface-card`) — product cards, forms. 1px `--color-border`, no shadow at rest.
3. **Raised** (`--surface-raised`) — tinted panel, used sparingly (filter bar, pull-quote, table stripe).
4. **Inverted** (`--surface-inverted`) — footer, and the dark scrim behind hero text over photography.

Shadow use: **one level only**, on hover/focus — `0 8px 24px rgba(36,26,29,0.12)`. Never a shadow at rest. A 1px border does the job most of the time.

## 6. Components

- **Primary button**: filled `--color-rouge`, white text, full pill (`border-radius: 999px`), 12px vertical / 24px horizontal padding, weight 600. Hover: `--color-rouge-deep`, no shadow needed — a filled pill darkening is enough feedback.
- **Secondary button**: transparent background, 1.5px `--color-ink` border, `--color-ink` text, same pill shape. Hover: fills `--surface-raised`.
- **Product card**: `--surface-card`, 16px radius (not a pill — pills are for buttons/badges only), 1px `--color-border`, image fills top at 4:5 ratio, 20px internal padding. Hover: image scales 1.03 over 200ms, no card shadow pop.
- **Badge/tag** ("Best Seller", "New"): pill shape, `--surface-raised` background, `--color-rouge` text, 0.6875rem all-caps, 0.06em tracking.
- **Price**: Inter 700, `--color-rouge`, no currency-symbol styling tricks.
- **Input**: `--surface-card` fill, 1px `--color-border`, 10px radius, 12px padding, focus ring is a 2px `--color-rouge` outline (not a glow/shadow).
- **Nav**: sticky, `--surface-card` at 92% opacity + backdrop blur when scrolled, logo left, links center/right, cart pill right. Active link gets a 2px rouge underline, not a background fill.

## 7. Responsive Behaviour

- Breakpoints: 375 / 768 / 1024 / 1280.
- Touch targets: 44px minimum on all interactive elements.
- Product grid collapses 4 → 3 → 2 → 1 (never below 2-col on mobile for the shop grid — single-column feels sparse for jar photography).
- Sticky nav collapses to a hamburger below 768px; cart pill stays visible at all sizes.

## 8. Do's and Don'ts

**Do:**
- Use real product photography full-bleed wherever a hero image is needed — the jars are the brand, not a gradient.
- Keep rouge to CTAs, links, prices, and active states only.
- Use gold only as a thin metallic accent (dividers, icon strokes) — it should feel like the jar lid, not a second brand color competing with rouge.
- Use pill shape consistently for every button and badge — it's the signature shape (ties back to the round jar lids).
- Write copy in a warm, first-person founder voice (see `about` content) — Leemah's voice, not corporate copy.

**Don't:**
- Don't use radial glow blobs or diagonal rainbow gradients as background decoration — this is the single biggest tell of the old site and must not reappear.
- Don't introduce a second chromatic accent color. If something needs to "pop" and rouge doesn't fit, use more whitespace or a gold hairline instead.
- Don't fill secondary buttons with rouge — only the primary CTA per view should be a filled pill.
- Don't use a drop shadow at rest — reach for a 1px border first.
- Don't set Fraunces in bold or all-caps — its personality collapses at heavy weights.
- Don't mix corner radii on the same component family (cards are always 16px, buttons/badges are always pill — never a mix).
- Don't use stock bakery photography — every hero/lifestyle image should be a real Leemah product shot or a real customer/founder photo.

## 9. Agent Prompt Guide (TL;DR)

Use `var(--color-rouge)` for every CTA, link, and price — nothing else gets that color. Buttons and badges are always full pill (`999px`); cards are always `16px` radius — never mix. Headings are Fraunces (never bold, never all-caps); everything else is Inter. Backgrounds are `--surface-canvas` (cream) with `--surface-card` (white) for panels — no gradients, no radial glows, no drop shadows at rest. Gold is a hairline/icon accent only. When in doubt, add whitespace, not a new color.

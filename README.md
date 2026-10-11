# Kilstar ICT and Business Consultants — Marketing Website

Multi-page marketing site for an IT &amp; cybersecurity services company.
HTML5 + Tailwind CSS v4 (locally compiled) + vanilla JavaScript. No frameworks,
no runtime dependencies, no CDN calls — the built site works from the filesystem
or from any static host, fully offline.

---

## Quick start

```bash
npm install          # Tailwind CLI (dev-only dependency)
npm run build        # assemble pages  ->  compile + minify CSS
npm run serve        # optional: preview at http://localhost:4173
```

Then open `index.html`. That is the whole deployment story — the root-level
HTML files are the output, so they can be uploaded to any static host as-is.

| Script | What it does |
| --- | --- |
| `npm run build` | `build:html` then `build:css` |
| `npm run build:html` | Assembles `src/partials/*` + `src/pages/*` into flat root-level `.html` |
| `npm run build:css` | Compiles `assets/css/main.css` -> `assets/css/app.css` (minified) |
| `npm run dev` | Tailwind in watch mode while editing markup/classes |

---

## Project structure

```
.
├── index.html            ┐
├── services.html         │  GENERATED — do not edit these directly.
├── industries.html       │  Edit src/pages/*.html and re-run build:html.
├── about.html            │
├── resources.html        │
├── contact.html          │
├── legal.html            ┘
│
├── src/
│   ├── partials/         Shared chrome, included on every page
│   │   ├── header.html       sticky nav + desktop dropdown + mobile drawer
│   │   ├── footer.html       nav, contact details, socials, copyright
│   │   └── audit-modal.html  reusable "Book an IT Audit" lead-gen dialog
│   └── pages/           One file per page = the <main> content only
│
├── assets/
│   ├── css/
│   │   ├── main.css      DESIGN SOURCE — tokens (@theme) + component layer
│   │   └── app.css       compiled output (generated, committed for deploys)
│   ├── js/main.js        all interactivity, no dependencies
│   └── img/              logo + favicon (inline SVG)
│
└── tools/
    ├── build-pages.mjs   page assembler
    ├── audit.mjs         dead links, ARIA targets, duplicate IDs, asset refs
    └── check-tags.mjs    tag-balance check
```

### Why the `src/` + `tools/` split

The header, footer and audit modal total ~365 lines and must stay identical on
all seven pages. Duplicating them by hand guarantees drift, so the builder
stamps them out and injects `aria-current="page"` on the correct nav item per
page. The *generated* HTML is still plain, readable, framework-free markup —
`view-source` on the live site will look exactly like hand-written HTML.

Edit `src/partials/*` once and run `npm run build:html`.

---

## Tailwind configuration (v4 CSS-first)

Tailwind v4 has no `tailwind.config.js` — configuration lives in CSS. The whole
design system is in `assets/css/main.css`:

1. **`@theme`** — design tokens. These become utilities automatically:
   - `navy-50…950` + `navy-975` (deep corporate primary)
   - `electric-50…950` (electric blue accent / CTA)
   - `teal-50…950` (secondary accent, dark surfaces)
   - `success-*`, `warning-*`, `danger-*`
   - `--font-sans` (system stack), `--shadow-*`, `--radius-*`, `--animate-*`, `--ease-*`
2. **`@layer base`** — element defaults, focus-visible ring, `scroll-padding-top`
   for the sticky header, reduced-motion overrides.
3. **`@utility`** — a few primitives (`btn`, `card`, `badge`, `check-list`)
   registered as *utilities* rather than components, because v4 only permits
   `@apply` on utilities. This is why `.btn-primary` can `@apply btn`.
4. **`@layer components`** — `.btn-*`, `.card-*`, `.input`, `.nav-link`,
   `.acc-*`, `.tab-btn`, `.icon-tile`, `.eyebrow`, plus the `[data-header]`,
   `[data-dropdown]`, `[data-nav-menu]` state rules driven by JS.
5. **`@layer utilities`** — `.text-gradient`, `.mask-fade-x`, `.no-scrollbar`,
   and the `[data-reveal]` scroll-animation states.

To rebrand, edit only the `@theme` block — every page inherits it.

### Fonts
System font stack by default (`Inter` → `system-ui` → `Segoe UI` → …), so there
is no webfont request and no layout shift. If you self-host Inter, it is picked
up automatically because it is first in the stack.

---

## JavaScript

`assets/js/main.js` (~600 lines, one IIFE, no dependencies). Every module guards
itself, so a page only wires up what it contains.

| Hook | Behaviour |
| --- | --- |
| `[data-header]` | Adds `is-scrolled` elevation past 8px (rAF-throttled) |
| `[data-nav-toggle]` / `[data-nav-menu]` | Mobile drawer, scroll lock, ESC, focus move, auto-close at ≥1024px, hamburger→close glyph swap |
| `[data-submenu]` | Nested "Services" disclosure inside the mobile drawer |
| `[data-dropdown]` | Desktop mega-menu: hover + click, ArrowDown, `focusout` close |
| `[data-tabs]` | WAI-ARIA tabs: click, Arrow/Home/End, roving `tabindex`, `tabchange` event |
| `[data-accordion]` | FAQ disclosure, `"single"` for one-at-a-time |
| `[data-modal]` / `[data-modal-open="id"]` | Dialog with backdrop dismiss, ESC, focus trap, focus restore, scroll lock, `#hash` deep link |
| `form[data-validate]` | Required/email/tel/minlength/checkbox/select rules, inline `aria-invalid` + `role="alert"` errors, error summary, focus first invalid, async submit + success state |
| `[data-reveal]` | IntersectionObserver fade-up with `data-reveal-delay` |
| `[data-counter]` | Animated `requestAnimationFrame` count-up with prefix/suffix/decimals |
| `[data-filter-group]` | Resource filtering by category + free-text search + live count + empty state |
| `?service=` | Pre-fills `select[name=service]` on contact/quote forms |

### Wiring the forms to a real backend

`initForms()` currently simulates the request. Replace the `setTimeout` block in
the submit handler (`assets/js/main.js`) with a real `fetch()` — the surrounding
validation, error summary, focus management and success state already work.

---

## Accessibility

- Skip-to-content link, landmark elements, one `<h1>` per page, ordered heading levels
- Visible `:focus-visible` ring on every interactive element
- Tabs: full ARIA pattern with keyboard support
- Accordions and disclosures use `aria-expanded` + `aria-controls`
- Dialog: `role="dialog"`, `aria-modal`, focus trap, focus restore, ESC
- Forms: real `<label for>`, `aria-invalid`, `aria-describedby`, `role="alert"`
  error summary, `aria-live` status region
- `prefers-reduced-motion` honoured in both CSS and JS (animations, count-ups and
  smooth scroll all stand down)
- Text contrast meets WCAG AA on both light and dark surfaces

### Progressive enhancement / resilience
- Content is never hidden without JS. Reveal animations are gated behind an
  `html.js` class set before first paint, plus a 5-second guard in `<head>` that
  removes the class if `main.js` fails to load.
- Nav is a real list of real links; the mobile drawer and dialogs are the only
  JS-dependent parts of the chrome.
- `autocomplete` attributes on all identity fields.

---

## Verification

```bash
node tools/audit.mjs        # dead links, ARIA refs, duplicate IDs, asset paths
node tools/check-tags.mjs   # tag balance
```

Current state: **7 pages, no dead links, no ARIA/ID issues, tag balance clean.**

Add these to CI — they take milliseconds and catch the two mistakes that actually
bite on a multi-page static site (a renamed page, a typo'd `#anchor`).

---

## Content / handoff notes

Everything below is placeholder content to be replaced before launch:

- **Contact details** — `+1 (555) 010-8800`, `hello@kilstar.example` and the
  Austin / Denver / Chicago / Dublin addresses.
- **Domain** — `kilstar.example` appears in the JSON-LD and schema markup, and in
  every `mailto:` link. `status.kilstar.example` is referenced on the resources FAQ.
- **Legal entity name** — the footer copyright and `legal.html` use "Kilstar ICT and
  Business Consultants" with no registered suffix. Add `Ltd`, `Pty (Ltd)`, `Inc`… if
  the company is incorporated.
- **Wordmark** — header/footer render "Kilstar" over "ICT & Business"
  (`src/partials/header.html`, `src/partials/footer.html`). The logo glyph in
  `assets/img/logo.svg` + `favicon.svg` is a two-tone "K"; the gradient id is
  `kilstar-g` in `logo.svg` and `g` in `favicon.svg`.
- **Client names, logos and testimonials** in the trust bar (`src/pages/index.html`)
  and the three testimonial cards. The marquee duplicates the logo list once so
  it loops seamlessly — if you change the list, keep it even-length *or* update
  the duplicate count.
- **Statistics** — 99.99% uptime, 420 engineers, 94% retention, pricing tiers and
  SLA tables are illustrative.
- **Social links** — footer points at `linkedin.com/company/kilstar-ict-consultants`,
  `x.com/kilstarict`, `facebook.com/kilstarict`, `youtube.com/@kilstarict` and
  `github.com/kilstar-ict-consultants`.
- **Resource downloads** — "Get it" buttons open the audit modal rather than
  serving a file.
- **Certifications** — SOC 2 / ISO 27001 badges are claims to verify.

### Page map

| Page | Purpose |
| --- | --- |
| `index.html` | Hero, trust marquee, 4 core services, stats, process, testimonials, lead form |
| `services.html` | 7-service tabbed catalogue, SLA tables, 3-tier pricing, 6-question FAQ |
| `industries.html` | 6 sector cards, compliance matrix, case study, sector CTA |
| `about.html` | Story, timeline, values, leadership, certifications, careers |
| `resources.html` | Featured guide, filterable 9-item library, newsletter, support FAQ |
| `contact.html` | Full quote form, office details, process, testimonials, FAQ |
| `legal.html` | Privacy / Terms / SLA — targets for the footer links |

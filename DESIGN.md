# WikiDrama — DESIGN.md

> Context file for AI design iteration via Google Stitch.
> This document describes the current visual system, component structure, and design rules as of April 2026.

---

## App Identity

- **Name**: WikiDrama
- **Concept**: Wikipedia edit wars turned into a card duel game. Two articles face off — guess which one generated the most controversy.
- **Platform**: Mobile-first web app (max-width: 448px / `max-w-md`)
- **Tone**: Dark, punchy, gamified. Think Wordle meets Wikipedia drama.

---

## Layout

- Single column, full-height, centered on mobile
- Root container: `max-w-md mx-auto min-h-screen flex flex-col bg-black`
- All pages fill the viewport height (`flex-1`)
- No sidebar, no nav bar — pure full-screen focus
- Safe area insets respected (iOS notch-aware)

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#000000` | App background, cards, everywhere |
| Surface | `zinc-900` (#18181b) | Buttons, panels, category cards |
| Border | `zinc-700/800` | Subtle card borders |
| Text primary | `#ffffff` | Headings, scores |
| Text secondary | `zinc-400` (#a1a1aa) | Subtitles, captions |
| Text muted | `zinc-600` (#52525b) | Footer, mono labels |
| Red accent | `red-500` (#ef4444) | Random Duel button, app name |
| Purple accent | `purple-800/950` | WikiWars special mode gradient |

### Drama Tier Colors

| Tier | Score | Text color | Bar color | Effect |
|---|---|---|---|---|
| Légendaire | 90–100 | `sky-300` | `sky-400` | Blue shimmer pulse (1.8s loop) |
| Énorme Drama | 75–89 | `yellow-300` | `yellow-400` | Gold shimmer pulse (1.8s loop) |
| Chaos total | 60–74 | `red-500` | `red-500` | None |
| Agité | 45–59 | `amber-500` | `amber-500` | None |
| Disputé | 30–44 | `yellow-400` | `yellow-400` | None |
| Calme | 15–29 | `green-400` | `green-400` | None |
| Aucun drama | 0–14 | `slate-400` | `slate-500` | None |

---

## Typography

- **Font**: Inter (Google Fonts) — weights 400, 600, 700, 800
- **Headings**: `font-extrabold` (800), tight tracking
- **App title**: `text-5xl font-extrabold` — "Wiki" white + "Drama" red-500
- **Drama score**: `text-4xl font-extrabold` colored by tier
- **Body**: `text-sm` / `text-xs` for descriptions, stats
- **Mono labels**: `font-mono text-xs text-zinc-600` (formula display)

---

## Screens & Components

### 1. Home (`/`)
- Full black background, centered column
- WikiGlobe SVG animation (80px) at top
- Title: `WikiDrama` (white + red "Drama")
- Tagline: `text-zinc-400 text-base`
- **3 mode buttons** stacked vertically with `gap-3`:
  - **Duel Random** — `bg-red-500`, rounded-2xl, py-5
  - **Duel Thématique** — `bg-zinc-900 border border-zinc-700`
  - **WikiWars** — purple gradient, `border-purple-800`, "✨ Special Mode" badge above
- Hover/touch: label fades out, description fades in (backdrop-blur overlay)
- Bottom: Drama Score formula card (`bg-zinc-900 border border-zinc-800 rounded-2xl`)
- Footer: GitHub + Play Store links, zinc-500 text

### 2. Duel (`/duel?mode=random|thematic`)
- **Split-screen** — two `DuelCard` stacked vertically, each takes 50% viewport height
- A thin horizontal separator with `VS` badge in the center
- Loading state: `LoadingDuel` spinner component
- Error states: offline message or generic error with retry button
- Bottom action bar (after reveal): **Partager** + **Rejouer** buttons

#### DuelCard (vote phase)
- Full-bleed Wikipedia thumbnail as background (`object-cover`)
- Dark overlay: `bg-black/60`
- Article title: `text-xl font-extrabold text-white text-center drop-shadow-lg`
- Short extract: pill with `bg-black/40 backdrop-blur-sm rounded-2xl text-xs`
- Vote button: subtle border pill `text-white/50 border border-white/20 rounded-full`

#### DuelCard (reveal phase)
- Winner: overlay brightens (`bg-black/40`), loser: `opacity-50`
- Legendary winner: `bg-sky-950/50` overlay + blue shimmer border + `legendary-shimmer` animation
- Enormous winner: `bg-yellow-950/40` overlay + gold shimmer border + `enormous-shimmer` animation
- Regular winner: `border-4 border-yellow-400`
- Score badge: `text-4xl font-extrabold` in tier color, with glow animation if Legendary/Enormous
- Tier label text below score
- Protected article: orange lock label
- Progress bar: `h-1.5 rounded-full` animated fill
- Stats grid: 2 columns × 3 rows, `text-xs text-white/80 bg-black/40 backdrop-blur-sm rounded-xl`
  - ✏️ edits count | 👥 unique editors
  - ↩️ reversion % | 👻 anon %
  - 👁️ watchers | ✂️ minor %

### 3. CategoryPicker (inside Duel thematic)
- Full-width list of category cards
- Each card: Wikipedia category thumbnail + emoji icon + category name
- Active/selected state: stronger border highlight
- Categories: Politique 🏗️, Sport ⚽, Pop Culture 🎬, Science 🔬, Histoire 📜, Religion ⚠️, Tech 📱

### 4. WikiWars (`/wikiwars`)
- Same split-screen layout as Duel
- Purple-tinted accents instead of red/gold
- Articles compared by Wikipedia pageviews (12 months) instead of Drama Score
- Tier system: Viral 💎 / Mondial 🌍 / Tendance 📈 / Populaire 👀 / Connu 📖 / Obscur 🌑

### 5. NotFound (`/*`)
- Centered, dark, simple 404 message
- Back-to-home button

### 6. ErrorBoundary
- Wraps entire app
- Two states: offline (no connection) / generic JS error
- Retry button that re-initializes the current mode

---

## Animations

| Name | Class | Description |
|---|---|---|
| Slide up | `.slide-up` | 0.25s cubic-bezier, used for bottom sheets |
| Fade in | `.fade-in` | 0.3s ease, used for reveal phase elements |
| Fill bar | `.fill-bar` | 0.8s animated progress bar on score reveal |
| Legendary shimmer | `.legendary-shimmer` | Blue border pulsing glow, 1.8s infinite |
| Legendary badge glow | `.legendary-badge-glow` | Badge box-shadow pulse |
| Legendary text glow | `.legendary-text-glow` | Score text-shadow pulse |
| Enormous shimmer | `.enormous-shimmer` | Gold border pulsing glow, 1.8s infinite |
| Enormous badge glow | `.enormous-badge-glow` | Gold badge pulse |
| Enormous text glow | `.enormous-text-glow` | Gold text pulse |

---

## Design Rules (do not break)

1. **Always black background** — never white, never gray as a base
2. **Mobile-first** — every design decision assumes a 390px-wide phone screen
3. **No account UI** — zero friction, no login/signup flows
4. **Drama tiers are sacred** — Legendary = blue glow, Enormous = gold glow. Never swap these colors
5. **Reveal is the payoff** — the reveal animation is the emotional core. Do not reduce it
6. **Split-screen duel** — top/bottom halves are the core UX pattern. Do not break into cards side-by-side
7. **Touch targets** — all interactive elements minimum 44px height
8. **No heavy animations** — shimmer effects only on Legendary/Enormous. Other tiers: static
9. **Typography contrast** — score text must always be clearly readable over the dark card overlay

---

## Tech Stack (for reference)

- Vite + React 18 + TypeScript
- Tailwind CSS v3
- React Router v6
- Data: Wikipedia REST API + XTools API (no auth required)
- Cache: localStorage, version key `wikistats-v9`
- Build: static SPA, deployed on Cloudflare Pages

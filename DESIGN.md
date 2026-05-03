# WikiDrama - Design System

> Source of truth for WikiDrama's current UI and interaction rules.
> Keep this file aligned with the code before making major UI changes.

## App Identity

- Name: WikiDrama
- Concept: Wikipedia edit wars and pageview battles turned into fast mobile duels
- Platform: mobile-first web app
- Width model: centered single-column app, `max-w-md`
- Tone: dramatic, playful, high-contrast, compact

## Core Product Patterns

- Home is a stacked mode selector with a strong logo moment and a live ticker
- Duel and WikiWars are split-screen top-vs-bottom experiences
- Reveal is the payoff and must stay visually stronger than the vote state
- The app should feel instant and lightweight: no account flows, no heavy setup, no backend UI

## Layout

- Root app container: `max-w-md mx-auto min-h-screen flex flex-col`
- Main screens fill the viewport height where needed, especially duel flows
- The app is designed phone-first and should remain comfortable around 390px wide
- Touch targets should stay at least 44px high

## Theme and Color Model

WikiDrama is no longer hard-coded to pure black only. The app supports dark and light themes through semantic tokens in [`src/index.css`](/C:/Users/jamil/wikidrama/src/index.css:7).

### Semantic tokens

- `bg-base`: main screen background
- `bg-card`: elevated card background
- `bg-panel`: modal and panel background
- `bg-btn` / `bg-btn-hover`: neutral action surfaces
- `border` / `border-border-strong`: separators and card outlines
- `text`, `text-muted`, `text-faint`: text hierarchy

### Accent colors

- Red: primary Duel accent
- Purple: WikiWars accent
- Sky: Legendary drama tier
- Gold/yellow: Enormous drama tier and Worldwide/Viral-adjacent celebration states

## Typography

- Font: Inter
- Headings: bold to extra-bold, tight and compact
- Home title: oversized, with "Drama" highlighted in red
- Body copy: short, compact, readable on mobile
- Mono text is reserved for formulas and share/export snippets

## Screens and Components

### Home (`/`)

- Contains the live ticker, animated logo, title, tagline, and 3 game modes
- Mode cards are stacked vertically
- Each mode card has a front face and a back face
- Front face: direct play CTA
- Back face: short mode description with `Retour` and `Jouer`
- `WikiWars` carries a special-mode badge
- Bottom formula card summarizes the Drama Score inputs
- Footer includes GitHub and placeholder store link

### Settings Modal

- Opened from the Home screen
- Focus-trapped modal
- Contains language, theme, and Sudden Death settings
- Includes the language source notice
- Uses glassy/dimmed dark styling even when the app supports light mode

### Duel (`/duel`)

- Thematic mode starts with a category picker
- Random mode loads directly into the duel
- Main duel layout is always top card vs bottom card
- Cards use article imagery when available, otherwise gradient fallbacks
- Vote state is simpler and dimmer than reveal state
- Reveal shows score, tier, progress bar, and article stats
- Protected articles get a dedicated badge
- Bottom bar changes between vote instruction and replay/share actions

### Category Picker

- Tap-to-play list, no separate selection confirmation
- Each row uses a thumbnail, custom category icon, label, and article count
- Categories are currently: Politics, Sport, Pop Culture, Science, History, Religion, Tech, YouTubeurs FR, YouTubeurs US

### WikiWars (`/wikiwars`)

- Reuses the split-screen duel pattern
- Uses purple accents instead of red
- Compares pageviews over 12 months instead of drama score
- Reveal shows formatted views, tier label, and popularity bar
- Share flow is a dedicated modal

### Share Sheets

- Duel and WikiWars both use bottom-sheet style share modals
- Share modals are focus-trapped
- Share content uses monospace preview blocks

### Error States

- Local page-level errors show retry and return-home actions
- Global `ErrorBoundary` exists and should remain visually simple

## Reveal Rules

- Reveal is the emotional core of the product
- Winners brighten; losers dim
- Regular winners get a visible accent border
- Legendary and Enormous states get shimmer and text glow
- Avoid weakening reveal by making vote state equally loud

## Tier Rules

### Drama tiers

- Legendary: blue/sky glow
- Enormous Drama: gold glow
- Total Chaos: strong red accent
- Lower tiers should remain readable but less theatrical

These color meanings should not be swapped.

### WikiWars tiers

- Viral
- Worldwide
- Trending
- Popular
- Known
- Obscure

WikiWars can share some celebration patterns with Duel, but it should remain purple-led overall.

## Motion

Current named motion patterns:

- `slide-up`: bottom-sheet entrance
- `fade-in`: soft reveal entrance
- `fill-bar`: animated score/progress fill
- `legendary-shimmer`: blue celebratory border glow
- `enormous-shimmer`: gold celebratory border glow
- `sudden-death-pulse`: countdown urgency state
- `wikidrama-logo` drama animation on interaction

Motion should feel intentional, not constant. The main heavy moments are:

- logo dramatization
- reveal celebration
- sudden death urgency

Respect `prefers-reduced-motion`.

## Non-Negotiable Constraints

1. Preserve the mobile-first single-column app structure.
2. Preserve the split-screen duel pattern for Duel and WikiWars.
3. Keep reveal stronger than vote.
4. Preserve the meaning of Legendary = blue and Enormous = gold.
5. Do not introduce account, signup, or backend-management UI unless explicitly requested.
6. Keep UI copy short and high-signal on mobile.
7. Maintain support for i18n and both theme modes.

## Notes for UI Work

- Check [`README.md`](/C:/Users/jamil/wikidrama/README.md:1) for product framing
- Check [`AGENTS.md`](/C:/Users/jamil/wikidrama/AGENTS.md:1) for repo workflow rules
- Before changing visuals, verify that this file still matches components in `src/pages` and `src/components`

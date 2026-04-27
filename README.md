# ⚔️ WikiDrama

> Two Wikipedia articles. Only one can be the most controversial — or the most read.

**WikiDrama** is a mobile-first web app that pits two Wikipedia articles against each other in a duel. Two main modes: the classic **Drama Score** based on edit wars, and the new **WikiWars** mode based on real pageview data.

[![Deploy](https://img.shields.io/badge/Live-wikidrama.pages.dev-red?style=flat-square)](https://wikidrama.pages.dev)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%2B%20Vite%20%2B%20Tailwind-blue?style=flat-square)]()
[![API](https://img.shields.io/badge/API-Wikipedia%20%2B%20Wikimedia-green?style=flat-square)]()

---

## 🎮 Game Modes

### ⚡ Random Duel
Two Wikipedia articles drawn at random from a pool of 400+ controversial topics. Guess which one sparked the most edit wars.

### 🗂️ Thematic Duel
Pick a theme from 9 categories (Politics, Sport, Pop Culture, Science, History, Religion, Tech, 🇫🇷 French YouTubers, 🇺🇸 US YouTubers) and face off two articles from the same universe.

### 📊 WikiWars _(Special Mode)_
Forget the drama — who got **read** the most? Guess which article racked up the most Wikipedia views over the **last 12 months** (Wikimedia Pageviews API).

---

## 🔥 Drama Score

Score computed from **6 Wikipedia metrics**:

| Metric | Source | Weight |
|---|---|---|
| Total edit count | XTools | High |
| Reversion rate | Wikipedia API | High |
| Unique editors | XTools | Medium |
| Anonymous edit rate | XTools | Medium |
| Watcher count | XTools | Medium |
| Minor edit rate | XTools | Low |

```
score = f(edits, rev, editors, anon, watch, minor)
```

Tiers: **Legendary** > **Enormous Drama** > **Total Chaos** > **Agitated** > **Disputed** > **Calm** > **No drama**

---

## 📊 WikiWars Tiers

| Tier | Views / 12 months |
|---|---|
| 💎 Viral | > 5M |
| 🌍 Global | 1M – 5M |
| 📈 Trending | 500k – 1M |
| 👀 Popular | 100k – 500k |
| 📖 Known | 20k – 100k |
| 🌑 Obscure | < 20k |

---

## 🚀 Stack

- **React 18** + TypeScript
- **Vite** (bundler)
- **Tailwind CSS** (mobile-first)
- **Wikipedia REST API** — summaries, revisions (EN + FR)
- **Wikimedia Pageviews API** — monthly views (WikiWars)
- **XTools API** — advanced stats (watchers, anon edits…)
- **Cloudflare Pages** (deployment)

---

## 📦 Run locally

```bash
git clone https://github.com/okash99/wikidrama
cd wikidrama
npm install
npm run dev
```

---

## ☁️ Cloudflare Pages Deployment

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Connect to Git**
2. Select `okash99/wikidrama`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

---

## 🖥️ Roadmap

### V1 — Done
- [x] Vite + React + Tailwind setup
- [x] Wikipedia API + DuelCard + localStorage cache
- [x] Drama Score (6 metrics)
- [x] ShareButton (Wordle-style)
- [x] Cloudflare Pages deployment

### V2 — Done
- [x] Thematic Duel (9 categories, 500+ articles)
- [x] WikiWars — 12-month pageviews mode
- [x] Hover descriptions on Home buttons
- [x] WikiWars sharing (WhatsApp, Twitter, copy)
- [x] GitHub + Play Store footer
- [x] CategoryPicker ring fix
- [x] Emoji/accent centralisation in `E.xxx`
- [x] 🇫🇷 French YouTubers category (fr.wikipedia.org)
- [x] 🇺🇸 US YouTubers category

### V3 — Wishlist
- [ ] Native app (React Native / Expo)
- [ ] Thematic WikiWars mode
- [ ] Saved scores & leaderboards
- [ ] User accounts
- [ ] Live Feed of articles currently in edit wars

---

*WikiDrama V2 — Powered by the Wikipedia API. No account required.*

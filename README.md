# 🌍 WikiDrama

> Two Wikipedia articles. Only one can be the most controversial — or the most read.

**WikiDrama** is a mobile-first web app that pits two Wikipedia articles against each other in a duel. Two main modes: the classic **Drama Score** based on edit wars, and the new **WikiWars** mode based on real pageview data.

![WikiDrama Home Screen](public/img/screenshot-home.png)

[![Deploy](https://img.shields.io/badge/Live-wikidrama.pages.dev-red?style=flat-square)](https://wikidrama.pages.dev)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%2B%20Vite%20%2B%20Tailwind-blue?style=flat-square)]()
[![API](https://img.shields.io/badge/API-Wikipedia%20%2B%20Wikimedia-green?style=flat-square)]()

---

## 🎨 New in V3
- **🌍 Global i18n**: Now supports 🇫🇷 French, 🇺🇸 English, 🇪🇸 Spanish, and 🇩🇪 German.
- **🌓 Dynamic Themes**: Full Dark/Light mode support with semantic tokens.
- **✨ Glassmorphism**: High-end translucent UI with real-time blur and RGB-opacity mapping.

---

## 🕹️ Game Modes

### 🔥 Random Duel
Two Wikipedia articles drawn at random from a pool of 400+ controversial topics. Guess which one sparked the most edit wars.

### 📁 Thematic Duel
Pick a theme from 9 categories (Politics, Sport, Pop Culture, Science, History, Religion, Tech, 🇫🇷 French YouTubers, 🇺🇸 US YouTubers) and face off two articles from the same universe.

### 📊 WikiWars _(Special Mode)_
Forget the drama — who got **read** the most? Guess which article racked up the most Wikipedia views over the **last 12 months** (Wikimedia Pageview API).

---

## 📈 Drama Score

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

## 🏆 WikiWars Tiers

| Tier | Views / 12 months |
|---|---|
| 👑 Viral | > 5M |
| 🌎 Global | 1M – 5M |
| 🚀 Trending | 500k – 1M |
| 🔥 Popular | 100k – 500k |
| 📖 Known | 20k – 100k |
| 🌑 Obscure | < 20k |

---

## 🛠️ Stack

- **React 18** + TypeScript
- **Vite** (bundler)
- **i18next** (Internationalization)
- **Tailwind CSS** (mobile-first)
- **Wikipedia REST API** — summaries, revisions (EN + FR)
- **Wikimedia Pageviews API** — monthly views (WikiWars)
- **XTools API** — advanced stats (watchers, anon edits…)
- **Cloudflare Pages** (deployment)

---

## 🚀 Run locally

```bash
git clone https://github.com/okash99/wikidrama
cd wikidrama
npm install
npm run dev
```

---

## 🔜 Roadmap & Upcoming Fixes

### 🛠️ High Priority Fixes
- [x] **UI Contrast**: Fix "Duel Thématique" font color in dark/light mode for better legibility.
- [x] **Badge Overlap**: Fix duplicate rank badges appearing on some cards.
- [x] **Protection Badge**: Add distinct border/outline to the "Protected by Wiki" badge.

### 🚀 V3 Evolution
- [x] Full i18n support (FR/EN/ES/DE)
- [x] Dynamic Theme System (Light/Dark)
- [x] RGB Opacity & Glassmorphism refactor
- [x] **UX & Accessibility Audit Phase 3 Fixes**: Mobile viewports, 3D flip cards, ARIA labels, semantic roles, and focus traps.
- [ ] **Streak counter** (Paused)
- [ ] **Thematic WikiWars mode**
- [ ] User accounts & saved scores
- [ ] Live Feed of ongoing edit wars

---

*WikiDrama V3 — Powered by the Wikipedia API. No account required.*

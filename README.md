# ⚔️ WikiDrama

> Les guerres d'édition Wikipedia transformées en duels épiques.

**WikiDrama** est une web app mobile-first qui oppose deux articles Wikipedia par leur **Drama Score** — un indice de controverse calculé depuis l'API Wikipedia (éditions, reversions, éditeurs uniques, vélocité récente).

## 🚀 Stack

- **React 18** + TypeScript
- **Vite** (bundler)
- **Tailwind CSS** (mobile-first)
- **Wikipedia REST API** (gratuite, sans clé)
- **Cloudflare Pages** (déploiement)

## 📦 Lancer en local

```bash
npm install
npm run dev
```

## ☁️ Déploiement Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Connect to Git**
2. Sélectionner `okash99/wikidrama`
3. Framework preset : **Vite**
4. Build command : `npm run build`
5. Output directory : `dist`
6. **Save & Deploy**

## 🗺️ Roadmap V1

- [x] Sprint 1 — Setup (Vite + React + Tailwind)
- [x] Sprint 2 — API Wikipedia + DuelCard + Cache + Stats
- [x] Sprint 3 — ShareButton (Wordle-style avec stats enrichies)
- [x] Sprint 4 — UI Polish, animations, edge cases, mobile finitions
- [ ] Sprint 5 — Déploiement Cloudflare Pages

## 📋 V2 (Wishlist)

Battle View, Classements, Live Feed, Compte utilisateur, React Native — voir PRP.

---

*WikiDrama — V1 in progress 🔥*

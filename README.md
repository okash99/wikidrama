# ⚔️ WikiDrama

> Deux articles Wikipedia. Un seul peut être le plus controversé — ou le plus lu.

**WikiDrama** est une web app mobile-first qui oppose deux articles Wikipedia en duel. Deux modes principaux : le classique **Drama Score** basé sur les guerres d'édition, et le nouveau mode **WikiWars** basé sur les pageviews réels.

[![Deploy](https://img.shields.io/badge/Live-wikidrama.pages.dev-red?style=flat-square)](https://wikidrama.pages.dev)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%2B%20Vite%20%2B%20Tailwind-blue?style=flat-square)]()
[![API](https://img.shields.io/badge/API-Wikipedia%20%2B%20Wikimedia-green?style=flat-square)]()

---

## 🎮 Modes de jeu

### ⚡ Duel Random
Deux articles Wikipedia tirés au hasard depuis un pool de +400 sujets controversés. Devine lequel a généré le plus de guerres d'édition.

### 🗂️ Duel Thématique
Choisis une thématique parmi 7 catégories (Politique, Sport, Pop Culture, Science, Histoire, Religion, Tech) et affronte deux articles du même univers.

### 📊 WikiWars _(Special Mode)_
Oublie le drama — qui a été le plus **lu** ? Devine quel article a cumulé le plus de vues Wikipedia sur les **12 derniers mois** (données Wikimedia pageviews API).

---

## 🔥 Drama Score

Score calculé sur **6 métriques Wikipedia** :

| Métrique | Source | Poids |
|---|---|---|
| Nombre total d'éditions | XTools | Haut |
| Taux de réversions | API Wikipedia | Haut |
| Éditeurs uniques | XTools | Moyen |
| Taux d'éditions anonymes | XTools | Moyen |
| Nombre de watchers | XTools | Moyen |
| Taux d'éditions mineures | XTools | Bas |

```
score = f(edits, rev, editors, anon, watch, minor)
```

Tiers : **Légendaire** > **Énorme Drama** > **Chaos total** > **Agité** > **Disputé** > **Calme** > **Aucun drama**

---

## 📊 WikiWars Tiers

| Tier | Vues / 12 mois |
|---|---|
| 💎 Viral | > 5M |
| 🌍 Mondial | 1M – 5M |
| 📈 Tendance | 500k – 1M |
| 👀 Populaire | 100k – 500k |
| 📖 Connu | 20k – 100k |
| 🌑 Obscur | < 20k |

---

## 🚀 Stack

- **React 18** + TypeScript
- **Vite** (bundler)
- **Tailwind CSS** (mobile-first)
- **Wikipedia REST API** — summaries, révisions
- **Wikimedia Pageviews API** — vues mensuelles (WikiWars)
- **XTools API** — stats avancées (watchers, anon edits...)
- **Cloudflare Pages** (déploiement)

---

## 📦 Lancer en local

```bash
git clone https://github.com/okash99/wikidrama
cd wikidrama
npm install
npm run dev
```

---

## ☁️ Déploiement Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Connect to Git**
2. Sélectionner `okash99/wikidrama`
3. Framework preset : **Vite**
4. Build command : `npm run build`
5. Output directory : `dist`

---

## 🖥️ Roadmap

### V1 — Done
- [x] Setup Vite + React + Tailwind
- [x] Wikipedia API + DuelCard + cache localStorage
- [x] Drama Score (6 métriques)
- [x] ShareButton (Wordle-style)
- [x] Déploiement Cloudflare Pages

### V2 — Done
- [x] Duel Thématique (7 catégories, +400 articles)
- [x] WikiWars — mode pageviews 12 mois
- [x] Hover descriptions sur les boutons de la Home
- [x] Partage WikiWars (WhatsApp, Twitter, copier)
- [x] Footer GitHub + Play Store
- [x] Fix ring CategoryPicker
- [x] Centralisation emojis/accents dans `E.xxx`

### V3 — Wishlist
- [ ] App native React Native / Expo
- [ ] Mode WikiWars Thématique
- [ ] Classements & scores sauvegardés
- [ ] Compte utilisateur
- [ ] Live Feed des articles en guerre d'édition en ce moment

---

*WikiDrama V2 — Propulsé par l'API Wikipedia. Aucun compte requis.*

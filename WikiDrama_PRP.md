# WikiDrama — Product Requirements Prompt (PRP)

> Version: V1 Stable — April 2026
> Repo: https://github.com/okash99/wikidrama

---

## Concept

WikiDrama transforme les guerres d'édition Wikipedia en un jeu de duel interactif.
Deux articles s'affrontent via leur **Drama Score** (0–100%) — un score calculé à partir de 6 métriques récupérées en live depuis l'API Wikipedia et XTools.

---

## Audience cible

| Profil | Description |
|---|---|
| Primaire | Curieux passionnés de culture générale, amateurs d'anecdotes absurdes |
| Secondaire | Gamers attirés par les scores et la compétition |
| Contexte | Mobile, transports, pause, canapé — sessions courtes 2–5 min |

---

## User Flow

1. Ouverture de l'app — écran d'accueil avec 3 modes
2. **Duel Random** : 2 articles Wikipedia tirés au hasard dans la pool DRAMA
3. **Duel Thématique** : choix d'une catégorie, 2 articles tirés dans cette thématique
4. **WikiWars** (mode spécial) : 2 articles comparés par pageviews (12 mois) plutôt que par drama
5. Affichage split-screen des 2 articles (vote phase)
6. Tap sur l'article jugé le plus controversé
7. Révélation : scores réels, tier, stats détaillées, animations par tier
8. Partager le duel (ShareButton via createPortal)
9. Rejouer

---

## Fonctionnalités V1 — État actuel (EN PROD)

| Feature | État | Notes |
|---|---|---|
| Duel Random | ✅ Stable | Pool DRAMA + LEGENDARY + ENORMOUS |
| Duel Thématique | ✅ Stable | 7 catégories + CategoryPicker |
| WikiWars | ✅ Stable | Mode pageviews 12 mois via Wikimedia API |
| Drama Score 6 métriques | ✅ Stable | edits, revert, editors, anon, watchers, minor |
| Tiers visuels 7 niveaux | ✅ Stable | Legendary blue glow / Enormous gold glow |
| Protection bonus | ✅ Stable | +10 pts si article protégé Wikipedia |
| ShareButton | ✅ Stable | createPortal, texte Wordle-style |
| ErrorBoundary global | ✅ Stable | Offline + generic error + retry |
| Timeout AbortController 8s | ✅ Stable | Sur tous les fetches |
| XTools retry x2 + fallback | ✅ Stable | Backoff 800ms, fallback Wikipedia si échec |
| Égalité de score (tie) | ✅ Stable | WinnerState: 0 │ 1 │ 'tie' |
| Déduplication articles | ✅ Stable | fetchDistinctPair, max 2 tentatives |
| Clear vieux cache | ✅ Stable | Purge clés v1–v8 au mount, garde v9 |
| Page 404 custom | ✅ Stable | React Router catch-all |
| Emojis fixes (pas d'escape) | ✅ Stable | Centralisés dans `utils/emojis.ts` |

---

## Drama Score — Formule actuelle

```
S = f(editCount×0.25, reversionRate×0.25, uniqueEditors×0.20,
       anonRate×0.15, watchers×0.10, minorInv×0.10)

relative = raw / TRUMP_RAW (0.6919)   → normalisé sur Trump comme étalon 100
curved   = relative^0.75              → power curve pour éviter l'effet plafond
baseScore = round(curved * 100)

+ protectionBonus (+10 si article protégé et score >= 20)
```

**Références (percentile 75 du pool) :**
- MAX_editCount: 20 000
- MAX_uniqueEditors: 3 500
- MAX_watchers: 2 000
- MAX_anonRate: 0.30

---

## Tiers Drama Score

| Tier | Score | Couleur | Effet |
|---|---|---|---|
| Légendaire | 90–100 | sky-300/400 | Blue shimmer pulse |
| Énorme Drama | 75–89 | yellow-300/400 | Gold shimmer pulse |
| Chaos total | 60–74 | red-500 | — |
| Agité | 45–59 | amber-500 | — |
| Disputé | 30–44 | yellow-400 | — |
| Calme | 15–29 | green-400 | — |
| Aucun drama | 0–14 | slate-400 | — |

---

## Pools d'articles

| Pool | Taille approx. | Usage |
|---|---|---|
| LEGENDARY_POOL | ~15 articles | Trump, COVID, Hitler, Israel-Hamas... |
| ENORMOUS_POOL | ~20 articles | Muhammad, Abortion, Putin, Jesus... |
| DRAMA_POOL (flat) | ~60 articles | Pool générale pour Random |
| Catégories | 7 thèmes | Politique, Sport, Pop Culture, Science, Histoire, Religion, Tech |

---

## Stack technique

| Élément | Choix |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| CSS | Tailwind CSS v3 |
| Router | React Router v6 |
| API drama | Wikipedia REST API + XTools (gratuits, no auth) |
| API pageviews | Wikimedia Pageviews API |
| Cache | localStorage, clé `wikistats-v9` |
| Déploiement | Cloudflare Pages (SPA + `_redirects`) |
| Repo | Public, https://github.com/okash99/wikidrama |

---

## Architecture fichiers

```
src/
  api/
    wikipedia.ts        # fetchArticleData, fetchWithTimeout, XTools retry
  components/
    CategoryPicker.tsx  # Sélection thématique
    DuelCard.tsx        # Carte article (vote + reveal)
    ErrorBoundary.tsx   # Global error/offline handler
    LoadingDuel.tsx     # Spinner chargement duel
    ShareButton.tsx     # Partage Wordle-style via createPortal
    WikiGlobe.tsx       # Logo SVG animé
    WikiLogo.tsx        # Logo texte
  data/
    articles.ts         # LEGENDARY_POOL, ENORMOUS_POOL, DRAMA_POOL, catégories
  pages/
    Duel.tsx            # Page duel (random + thématique)
    Home.tsx            # Écran d'accueil
    NotFound.tsx        # 404
    WikiWars.tsx        # Mode pageviews
  utils/
    cache.ts            # clearOldCacheVersions()
    dramaScore.ts       # computeDramaScore, tiers, colors, labels
    emojis.ts           # Constante E{} centralisée
  App.tsx               # Routes + ErrorBoundary
  main.tsx              # Entry point
  index.css             # Tailwind + animations custom
```

---

## Roadmap (prochain sprint)

### Phase 1 — V1.5 (polish loop de jeu)
- [ ] Nouveau thème : **Théories Complot** (QAnon, Flat Earth, Area 51, Illuminati...)
- [ ] Enrichissement pools : +50 articles (LEGENDARY + ENORMOUS + catégories)
- [ ] Streak compteur (localStorage, sans compte)
- [ ] Animation révélation améliorée (suspense 1s avant affichage scores)
- [ ] Score de session (X/10 bons duels ce soir)
- [ ] Partage image OG (canvas au lieu de texte brut)
- [ ] WikiWars ShareButton : gérer le cas tie

### Phase 2 — V2 (nouvelles surfaces)
- [ ] Top Drama du jour (cache 24h, 5 articles les plus chauds)
- [ ] Graphe d'éditions sur article (mini courbe temporelle)
- [ ] Hall of Shame (guerres d'édition les plus absurdes)
- [ ] Mode Tournoi (4 articles, bracket 2 votes)

### Phase 3 — V2.5 (social léger, sans backend)
- [ ] URL de duel partageable (replay exact du même duel)
- [ ] Défi ami (éncode résultat en query params)
- [ ] Duel du jour (seed fixe = date, comme Wordle)

### Phase 4 — V3 (natif + social, gros chantier)
- [ ] React Native Expo (iOS + Android)
- [ ] Compte optionnel (historique, badges)
- [ ] Live Feed (recentchanges API)
- [ ] Résumé IA (Gemini Nano)
- [ ] Notifications push

---

## Design

Voir `DESIGN.md` pour le système visuel complet (palette, tiers, composants, animations, règles).

---

## Contraintes permanentes

- Zéro compte utilisateur requis (V1 et V1.5)
- Zéro backend propre (tout via API Wikipedia publique)
- Mobile-first obligatoire (max-w-md, touch targets 44px min)
- Pas d'IA en V1/V1.5

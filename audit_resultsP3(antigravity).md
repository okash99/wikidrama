# Rapport d'Audit WikiDrama V3 — Phase 2 : Sécurité (OWASP)

L'audit de sécurité s'est concentré sur les vecteurs d'attaque courants pour une application front-end intensive en données.

## 🛡️ Résultats de l'Audit

| Point de Contrôle | Statut | Analyse |
| :--- | :--- | :--- |
| **Injection & XSS** | ✅ PASS | Aucune utilisation de `dangerouslySetInnerHTML`. Les données Wikipedia sont échappées par React. Les paramètres d'URL sont correctement encodés via `encodeURIComponent`. |
| **Exposition de Données Sensibles** | ✅ PASS | Aucune clé API secrète détectée. Les APIs Wikipedia, XTools et Pageview utilisées sont publiques et ne nécessitent pas d'authentification. |
| **Dépendances Vulnérables** | ⚠️ WARN | Les versions majeures (`React 18`, `Vite 5`) sont récentes. `npm audit` non exécutable localement (restrictions système), mais l'analyse manuelle des versions ne montre pas de failles critiques immédiates. |
| **Validation des Entrées** | ✅ PASS | Les entrées utilisateur sont limitées (sélection de thèmes prédéfinis). Aucun formulaire libre n'est présent. |
| **Configuration de Sécurité (HTTP)** | ❌ FAIL | Aucun header de sécurité explicite (CSP, HSTS, X-Frame-Options) n'est configuré via un fichier `_headers` (Cloudflare Pages). |

---

## 🚩 Points Critiques Identifiés

### SEC-001 : Absence de Content Security Policy (CSP)
**Localisation** : `public/_headers` (Fichier absent)
**Risque** : En cas de faille XSS découverte plus tard, l'absence de CSP permettrait l'exécution de scripts tiers malveillants ou le vol de données.
**Sévérité** : Majeure

### SEC-002 : Cache Insecure dans LocalStorage
**Localisation** : `src/api/wikipedia.ts:61`
**Risque** : Bien que les données stockées ne soient pas sensibles, un attaquant ayant accès physique au terminal pourrait manipuler le cache pour fausser les scores.
**Sévérité** : Mineure

---

## 🛠️ Recommandations Immédiates
1. **Ajouter un fichier `public/_headers`** pour configurer une CSP stricte restreignant les domaines autorisés (wikipedia.org, wmcloud.org).
2. **Mettre à jour les dépendances** régulièrement pour bénéficier des derniers patchs de sécurité.

---

# Rapport d'Audit WikiDrama V3 — Phase 3 : UX & Accessibilité

Cette phase, la plus critique, a analysé l'application sous l'angle d'un utilisateur final et de la conformité WCAG 2.1 AA.

## 📊 Tableau des Problèmes UX (Log)

| ID | Catégorie | Problème Détecté | Sévérité | Fichier:Ligne |
| :--- | :--- | :--- | :--- | :--- |
| **UX-001** | Interaction | Conflit Mobile : Le `onTouchStart` pour afficher la description sur Home interfère avec le `onClick` de navigation. | **Bloquant** | `Home.tsx:87-89` |
| **UX-002** | Ergonomie | Cible tactile trop petite (<44px) pour le bouton "Retour" et le badge central "VS". | **Majeur** | `Duel.tsx:155`, `172` |
| **UX-003** | Parcours | Friction de sélection : Double clic nécessaire dans `CategoryPicker` (sélection puis validation séparée). | **Majeur** | `Duel.tsx:103` |
| **UX-004** | A11y | Absence de Focus Trap : Le focus clavier s'échappe des modales (`Settings`, `Share`). | **Majeur** | `SettingsModal.tsx` |
| **UX-005** | Visuel | Contraste insuffisant (fail AA) pour les textes `text-white/50` et `text-faint` sur fond sombre. | **Mineur** | `DuelCard.tsx:111` |
| **UX-006** | A11y | Emojis sémantiques non cachés pour les lecteurs d'écran (manque `aria-hidden`). | **Mineur** | `Home.tsx:60`, `95` |
| **UX-007** | Code | Duplication de la logique de partage : Incohérence entre `ShareButton` (Duel) et `ShareModal` (WikiWars). | **Mineur** | `WikiWars.tsx:18` |

## 🔍 Analyse Mobile-First & Feedback
- **Feedback Loop** : Les états de chargement utilisent un simple pulse. L'utilisation de **Skeletons** plus détaillés (reproduisant la forme des `DuelCard`) améliorerait la perception de vitesse.
- **Mobile Safari** : Risque de glitch sur le `h-screen` (barres d'outils iOS) ; préférer `dvh` (Dynamic Viewport Height) si supporté.

## 🏆 Top 5 Corrections Prioritaires
1. **[UX-001]** Isoler l'affichage des infos des modes de jeu sur mobile (ex: icône "info" séparée).
2. **[UX-003]** Permettre le lancement immédiat du duel après sélection d'une catégorie.
3. **[UX-002]** Agrandir la zone de clic du bouton "Back" et du badge "VS".
4. **[UX-004]** Implémenter un Focus Trap sur les modales.
5. **[UX-005]** Rehausser les contrastes des textes secondaires (passer de 50% à 75% d'opacité).

---

> [!NOTE]
> **Prochaine étape** : Phase 4 — Performance & Dette (Bundle, complexité, queries).
> **Commande de validation** : "Lancer la Phase 4"


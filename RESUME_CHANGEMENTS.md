# Résumé des changements (Sprints 1b & 2)

Ce document récapitule l'ensemble des modifications apportées au code pour résoudre les problèmes soulevés lors de l'audit UX et Accessibilité.

## 1. Corrections UX Mobile (Sprint 1b)

- **`index.html`** : Suppression des restrictions `maximum-scale=1.0` et `user-scalable=no` dans la balise `<meta name="viewport">` pour autoriser le zoom natif du navigateur, améliorant l'accessibilité globale.
- **Refonte des cartes de modes de jeu (`src/pages/Home.tsx`)** :
  - Suppression de l'événement `onTouchStart` et du système de survol (`hover`) qui causait des conflits avec le bouton "Info".
  - Implémentation d'une **Carte Réversible (Flip Card 3D)** : le texte de description est désormais au dos de la carte.
  - Le clic sur l'icône **ⓘ** déclenche une rotation 3D fluide, révélant la description ainsi que deux boutons d'action explicites ("Retour" et "Jouer"). Cela garantit une accessibilité parfaite sur mobile et évite tout débordement de texte.
- **Correction des débordements sur iOS (`src/pages/Duel.tsx`, `src/pages/WikiWars.tsx`)** : 
  - Remplacement de la classe CSS `h-screen` par `h-dvh` (Dynamic Viewport Height) pour garantir que l'interface ne soit pas masquée par la barre d'adresse de Safari Mobile.
- **Faux liens déceptifs (`src/pages/Home.tsx`)** : 
  - Le lien vers le Play Store, qui ne menait nulle part, a été converti d'une balise `<a>` en une balise `<span>` avec une indication `cursor-not-allowed` et une opacité réduite pour refléter visuellement qu'il n'est pas encore actif.
- **Modale de partage WikiWars (`src/pages/WikiWars.tsx`)** :
  - Ajout d'un verrouillage du défilement (`overflow: hidden` sur le `body`) lorsque la modale de partage est ouverte, pour éviter que le fond ne défile sur mobile.
  - Amélioration et correction des textes de partage pour le mode WikiWars.

## 2. Accessibilité & ARIA (Sprint 2)

- **Masquage des emojis décoratifs (`src/pages/Home.tsx`)** :
  - Ajout de l'attribut `aria-hidden="true"` sur l'emoji globe (🌍) et l'étincelle (✨) du mode spécial pour éviter que les lecteurs d'écran ne les annoncent inutilement.
- **États de sélection (`src/components/CategoryPicker.tsx`)** :
  - Ajout de l'attribut `aria-pressed={isSelected}` sur chaque bouton de catégorie dans le sélecteur, permettant aux lecteurs d'écran d'annoncer quelle catégorie est actuellement sélectionnée.
- **Boutons de retour explicites (`src/pages/Duel.tsx`, `src/pages/WikiWars.tsx`)** :
  - Ajout de `aria-label={t('backHome')}` (qui se traduira par "Retour accueil") sur les boutons "←" situés en haut à gauche des interfaces de jeu.

## 3. Internationalisation (i18n)

- **Modale de paramètres (`src/components/SettingsModal.tsx`)** :
  - Remplacement des mots codés en dur "Dark" et "Light" par les clés de traduction dynamiques `{t('themeDark')}` et `{t('themeLight')}`.
- **Fichiers de langues (`src/i18n/*.ts`)** :
  - Ajout des clés `themeDark` et `themeLight` dans les 4 fichiers de langue (Français, Anglais, Espagnol, Allemand) pour garantir l'affichage correct (ex: Sombre/Clair, Oscuro/Claro, etc.).

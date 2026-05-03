# AGENTS.md

## Project Context

WikiDrama is a mobile-first React + Vite app where players compare two Wikipedia articles and guess which one is more controversial or more viewed.

Key references:

- [`README.md`](/C:/Users/jamil/wikidrama/README.md:1) for product overview and setup
- [`DESIGN.md`](/C:/Users/jamil/wikidrama/DESIGN.md:1) for UI rules and interaction patterns

## Commands

```bash
npm install
npm run dev
npm run build
```

## Working Rules

- Read the relevant files before proposing or making changes.
- Keep changes minimal and scoped to the task.
- Respect the existing React, i18n, theming, and API-access patterns.
- Avoid opportunistic refactors unless they are necessary to complete the requested work.
- For non-trivial or multi-file changes, explore first and propose a short plan before editing.
- Do not widen scope without a clear reason.

## Product Constraints

- Preserve the mobile-first `max-w-md` app model.
- Preserve the split-screen duel layout for Duel and WikiWars.
- Preserve reveal as the main payoff moment.
- Preserve the meaning of Legendary = blue and Enormous = gold.
- Do not add account, signup, or backend-management UI unless explicitly requested.
- Keep all UI changes compatible with the existing i18n and dark/light theme model.

## API and Data Boundaries

- Validate carefully at the edges: Wikipedia APIs, Wikimedia pageviews, XTools responses, local cache, and user-facing share text.
- Do not hardcode secrets or introduce server-only assumptions into the frontend.

## Visual Verification

- Do not launch browser-based visual verification or screenshot workflows without asking first.
- When visual checking is needed, provide a concise manual checklist for the user instead.

## Git Rules

- Do not commit, push, or merge unless explicitly asked.
- Stage specific files only.

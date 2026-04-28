---
trigger: always_on
---

# Règles de workflow WikiDrama

## Vérification visuelle (browser / screenshots)
Ne lance jamais de browser subagent pour prendre des screenshots ou vérifier visuellement l'UI sans demander d'abord à l'utilisateur. À la place, fournis une checklist précise de ce qu'il doit vérifier manuellement (pages à ouvrir, éléments à inspecter, textes attendus, langues à tester). L'utilisateur fera les vérifications lui-même et rapportera le résultat. Cela économise des tokens et donne un meilleur contrôle à l'utilisateur.

// Drama Score — normalisé 0 à 100%
// Basé sur : editCount, uniqueEditors, recentEdits

const WEIGHTS = {
  editCount: 0.30,
  reversionRate: 0.40,  // placeholder — sera affiné Sprint 3
  uniqueEditors: 0.20,
  recentVelocity: 0.10,
}

// Valeurs de référence pour normalisation (calibrées sur ~50 articles)
const MAX_REFS = {
  editCount: 500,
  uniqueEditors: 200,
  recentEdits: 50,
}

export function computeDramaScore(stats: {
  editCount: number
  uniqueEditors: number
  recentEdits: number
}): number {
  const normEdits = Math.min(stats.editCount / MAX_REFS.editCount, 1)
  const normEditors = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normRecent = Math.min(stats.recentEdits / MAX_REFS.recentEdits, 1)

  // Reversion rate placeholder (0.5 par défaut jusqu'au Sprint 3)
  const revRate = 0.5

  const score =
    normEdits * WEIGHTS.editCount +
    revRate * WEIGHTS.reversionRate +
    normEditors * WEIGHTS.uniqueEditors +
    normRecent * WEIGHTS.recentVelocity

  return Math.round(score * 100)
}

// Couleur selon le score
export function getDramaColor(score: number): string {
  if (score >= 70) return 'text-red-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-green-500'
}

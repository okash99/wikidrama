import type { ArticleStats } from '../api/wikipedia'

// Constantes de normalisation calées sur le record absolu Wikipedia (Donald Trump)
const MAX_REFS = {
  editCount:     52256, // record Trump
  uniqueEditors:  7530, // record Trump
  recentEdits:     234, // record Trump
}

const WEIGHTS = {
  editCount:      0.40,
  reversionRate:  0.25,
  uniqueEditors:  0.25,
  recentVelocity: 0.10,
}

// Score brut de Trump = référence 100%
// editCount=52256 → 1.0, uniqueEditors=7530 → 1.0, recentEdits=234 → 1.0, reversionRate=14% → 0.14
const TRUMP_RAW = 1.0 * 0.40 + 0.14 * 0.25 + 1.0 * 0.25 + 1.0 * 0.10 // = 0.785

export function computeDramaScore(stats: ArticleStats): number {
  const normEdits   = Math.min(stats.editCount    / MAX_REFS.editCount,    1)
  const normEditors = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normRecent  = Math.min(stats.recentEdits  / MAX_REFS.recentEdits,  1)
  const normRevert  = Math.min(stats.reversionRate / 100, 1)

  const raw =
    normEdits   * WEIGHTS.editCount +
    normRevert  * WEIGHTS.reversionRate +
    normEditors * WEIGHTS.uniqueEditors +
    normRecent  * WEIGHTS.recentVelocity

  // Normalisation relative : Trump = 100%
  const relative = Math.min(raw / TRUMP_RAW, 1)

  // Courbe douce pour étaler la distribution vers les extrêmes
  const curved = Math.pow(relative, 0.75)

  return Math.round(curved * 100)
}

export type DramaTier = 'legendary' | 'enormous' | 'chaos' | 'agitated' | 'disputed' | 'calm' | 'none'

export function getDramaTier(score: number): DramaTier {
  if (score >= 90) return 'legendary'
  if (score >= 75) return 'enormous'
  if (score >= 60) return 'chaos'
  if (score >= 45) return 'agitated'
  if (score >= 30) return 'disputed'
  if (score >= 15) return 'calm'
  return 'none'
}

export function getDramaColor(score: number): string {
  const tier = getDramaTier(score)
  if (tier === 'legendary') return 'text-sky-300'
  if (tier === 'enormous')  return 'text-yellow-300'
  if (tier === 'chaos')     return 'text-red-500'
  if (tier === 'agitated')  return 'text-amber-500'
  if (tier === 'disputed')  return 'text-yellow-400'
  if (tier === 'calm')      return 'text-green-400'
  return 'text-slate-400'
}

export function getDramaBarColor(score: number): string {
  const tier = getDramaTier(score)
  if (tier === 'legendary') return 'bg-sky-400'
  if (tier === 'enormous')  return 'bg-yellow-400'
  if (tier === 'chaos')     return 'bg-red-500'
  if (tier === 'agitated')  return 'bg-amber-500'
  if (tier === 'disputed')  return 'bg-yellow-400'
  if (tier === 'calm')      return 'bg-green-400'
  return 'bg-slate-500'
}

export function getDramaLabel(score: number): string {
  const tier = getDramaTier(score)
  if (tier === 'legendary') return '💎 Légendaire'
  if (tier === 'enormous')  return '🌟 Énorme Drama'
  if (tier === 'chaos')     return '🔥 Chaos total'
  if (tier === 'agitated')  return '🌶️ Agité'
  if (tier === 'disputed')  return '😤 Disputé'
  if (tier === 'calm')      return '😐 Calme'
  return '😴 Aucun drama'
}

export function isLegendary(score: number): boolean { return score >= 90 }
export function isEnormous(score: number): boolean  { return score >= 75 && score < 90 }

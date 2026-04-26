import type { ArticleStats } from '../api/wikipedia'

const MAX_REFS = {
  editCount:     20000,
  uniqueEditors:  3500,
  watchers:       2000,
  anonRate:       0.30,
}

const WEIGHTS = {
  editCount:      0.25,
  reversionRate:  0.25,
  uniqueEditors:  0.20,
  anonRate:       0.15,
  watchers:       0.10,
  minorInv:       0.10,
}

// TRUMP_RAW calculé avec poids ci-dessus (voir commit précédent)
const TRUMP_RAW = 0.6919

// Bonus protection : +10 pts si article protégé ET score brut ≥ 20
// Évite de booster des stubs verrouillés contre le vandalisme
const PROTECTION_BONUS = 10
const PROTECTION_MIN_SCORE = 20

export function computeDramaScore(stats: ArticleStats): number {
  const normEdits    = Math.min(stats.editCount     / MAX_REFS.editCount,     1)
  const normEditors  = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normWatch    = Math.min(stats.watchers      / MAX_REFS.watchers,      1)
  const normAnon     = Math.min(stats.anonRate      / MAX_REFS.anonRate,      1)
  const normMinorInv = 1 - Math.min(stats.minorRate, 1)
  const normRevert   = Math.min(stats.reversionRate / 100, 1)

  const raw =
    normEdits    * WEIGHTS.editCount +
    normRevert   * WEIGHTS.reversionRate +
    normEditors  * WEIGHTS.uniqueEditors +
    normAnon     * WEIGHTS.anonRate +
    normWatch    * WEIGHTS.watchers +
    normMinorInv * WEIGHTS.minorInv

  const relative = Math.min(raw / TRUMP_RAW, 1)
  const curved   = Math.pow(relative, 0.75)
  const baseScore = Math.round(curved * 100)

  const protectionBonus = (stats.protected && baseScore >= PROTECTION_MIN_SCORE)
    ? PROTECTION_BONUS
    : 0

  return Math.min(baseScore + protectionBonus, 100)
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
  if (tier === 'legendary') return '\ud83d\udc8e L\u00e9gendaire'
  if (tier === 'enormous')  return '\ud83c\udf1f \u00c9norme Drama'
  if (tier === 'chaos')     return '\ud83d\udd25 Chaos total'
  if (tier === 'agitated')  return '\ud83c\udf36\ufe0f Agit\u00e9'
  if (tier === 'disputed')  return '\ud83d\ude24 Disput\u00e9'
  if (tier === 'calm')      return '\ud83d\ude10 Calme'
  return '\ud83d\ude34 Aucun drama'
}

export function isLegendary(score: number): boolean { return score >= 90 }
export function isEnormous(score: number): boolean  { return score >= 75 && score < 90 }

import type { ArticleStats } from '../api/wikipedia'

// MAX_REFS = percentile 75 du pool connu — pas les valeurs absolues de Trump
// Cela permet à tout nouvel article de s'intégrer naturellement sans recalibrage
const MAX_REFS = {
  editCount:     20000,  // p75 du pool (Trump = 52256, mais il est l'exception absolue)
  uniqueEditors:  3500,
  watchers:       2000,
  anonRate:       0.30,  // ratio anon_edits / revisions
}

const WEIGHTS = {
  editCount:      0.30,
  reversionRate:  0.15,  // réduit — fort signal mais Trump a seulement 14% malgré son volume
  uniqueEditors:  0.20,
  anonRate:       0.15,  // nouveaux — vandalisme / guerres d'édition spontanées
  watchers:       0.10,  // nouveaux — vigilance communautaire Wikipedia
  minorInv:       0.10,  // nouveaux — inverse du ratio edits mineurs
}

// Score brut de Trump avec les vraies valeurs XTools et les nouveaux poids
// revisions=52256, editors=7530, watchers=4439, anon_edits=2643, minor_edits=9638, revert=14%
// ne=1.0, nu=1.0, nw=1.0, na=min(0.0506/0.30,1)=0.169, nm=0.816, nr=0.14
const TRUMP_RAW = 0.7278

export function computeDramaScore(stats: ArticleStats): number {
  const normEdits   = Math.min(stats.editCount     / MAX_REFS.editCount,    1)
  const normEditors = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normWatch   = Math.min(stats.watchers      / MAX_REFS.watchers,     1)
  const normAnon    = Math.min(stats.anonRate      / MAX_REFS.anonRate,     1)
  const normMinorInv = 1 - Math.min(stats.minorRate, 1)
  const normRevert  = Math.min(stats.reversionRate / 100, 1)

  const raw =
    normEdits    * WEIGHTS.editCount +
    normRevert   * WEIGHTS.reversionRate +
    normEditors  * WEIGHTS.uniqueEditors +
    normAnon     * WEIGHTS.anonRate +
    normWatch    * WEIGHTS.watchers +
    normMinorInv * WEIGHTS.minorInv

  const relative = Math.min(raw / TRUMP_RAW, 1)
  const curved   = Math.pow(relative, 0.75)

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

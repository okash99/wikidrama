import type { ArticleStats } from '../api/wikipedia'

// MAX_REFS = percentile 75 du pool connu
const MAX_REFS = {
  editCount:     20000,
  uniqueEditors:  3500,
  watchers:       2000,
  anonRate:       0.30,
}

// Poids validés : editCount 25%, reversionRate 25%, uniqueEditors 20%,
// anonRate 15%, watchers 10%, minorInv 10% — total = 1.00
const WEIGHTS = {
  editCount:      0.25,
  reversionRate:  0.25,
  uniqueEditors:  0.20,
  anonRate:       0.15,
  watchers:       0.10,
  minorInv:       0.10,
}

// Score brut de Trump avec les vraies valeurs XTools et les poids ci-dessus
// revisions=52256 → ne=1.0, editors=7530 → nu=1.0, watchers=4439 → nw=1.0
// anon_edits=2643/52256 → anonRate=0.0506 → na=min(0.0506/0.30,1)=0.1687
// minor_edits=9638/52256 → minorRate=0.1844 → minorInv=0.8156
// reversionRate=14% → nr=0.14
// raw = 1.0*0.25 + 0.14*0.25 + 1.0*0.20 + 0.1687*0.15 + 1.0*0.10 + 0.8156*0.10
//     = 0.25 + 0.035 + 0.20 + 0.02530 + 0.10 + 0.08156 = 0.69186
const TRUMP_RAW = 0.6919

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

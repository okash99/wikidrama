import type { ArticleStats } from '../api/wikipedia'
import { E } from './emojis'

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

const TRUMP_RAW = 0.6919
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

  const relative  = Math.min(raw / TRUMP_RAW, 1)
  const curved    = Math.pow(relative, 0.75)
  const baseScore = Math.round(curved * 100)

  const protectionBonus = (stats.protected && baseScore >= PROTECTION_MIN_SCORE)
    ? PROTECTION_BONUS : 0

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

/** Returns emoji + i18n key so callers can do: t(getDramaTierKey(score)) */
export function getDramaTierKey(score: number): string {
  const tier = getDramaTier(score)
  const map: Record<DramaTier, string> = {
    legendary: 'tierLegendary',
    enormous:  'tierEnormous',
    chaos:     'tierChaos',
    agitated:  'tierAgitated',
    disputed:  'tierDisputed',
    calm:      'tierCalm',
    none:      'tierNone',
  }
  return map[tier]
}

export function getDramaTierEmoji(score: number): string {
  const tier = getDramaTier(score)
  if (tier === 'legendary') return E.legendary
  if (tier === 'enormous')  return E.enormous
  if (tier === 'chaos')     return E.chaos
  if (tier === 'agitated')  return E.agitated
  if (tier === 'disputed')  return E.disputed
  if (tier === 'calm')      return E.calm
  return E.none
}

/** @deprecated use getDramaTierKey + getDramaTierEmoji with t() instead */
export function getDramaLabel(score: number): string {
  return `${getDramaTierEmoji(score)} ${getDramaTierKey(score)}`
}

export function isLegendary(score: number): boolean { return score >= 90 }
export function isEnormous(score: number): boolean  { return score >= 75 && score < 90 }

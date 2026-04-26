import type { ArticleStats } from '../api/wikipedia'

const MAX_REFS = {
  editCount: 10000,
  uniqueEditors: 1000,
  recentEdits: 100,
}

const WEIGHTS = {
  editCount:      0.40,
  reversionRate:  0.25,
  uniqueEditors:  0.25,
  recentVelocity: 0.10,
}

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

  const curved = Math.pow(raw, 0.7)
  return Math.round(curved * 100)
}

export function getDramaColor(score: number): string {
  if (score >= 90) return 'text-purple-400'
  if (score >= 75) return 'text-red-500'
  if (score >= 60) return 'text-orange-500'
  if (score >= 45) return 'text-amber-500'
  if (score >= 30) return 'text-yellow-400'
  if (score >= 15) return 'text-green-400'
  return 'text-slate-400'
}

export function getDramaBarColor(score: number): string {
  if (score >= 90) return 'bg-purple-500'
  if (score >= 75) return 'bg-red-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 45) return 'bg-amber-500'
  if (score >= 30) return 'bg-yellow-400'
  if (score >= 15) return 'bg-green-400'
  return 'bg-slate-500'
}

export function getDramaLabel(score: number): string {
  if (score >= 90) return '💎 Légendaire'
  if (score >= 75) return '🔥 Chaos total'
  if (score >= 60) return '⚡ Très controversé'
  if (score >= 45) return '🌶️ Agité'
  if (score >= 30) return '😤 Disputé'
  if (score >= 15) return '😐 Calme'
  return '😴 Aucun drama'
}

export function isLegendary(score: number): boolean {
  return score >= 90
}

import type { ArticleStats } from '../api/wikipedia'

const MAX_REFS = {
  editCount: 500,
  uniqueEditors: 200,
  recentEdits: 50,
}

const WEIGHTS = {
  editCount: 0.30,
  reversionRate: 0.40,
  uniqueEditors: 0.20,
  recentVelocity: 0.10,
}

export function computeDramaScore(stats: ArticleStats): number {
  const normEdits = Math.min(stats.editCount / MAX_REFS.editCount, 1)
  const normEditors = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normRecent = Math.min(stats.recentEdits / MAX_REFS.recentEdits, 1)
  const normRevert = Math.min(stats.reversionRate / 100, 1)

  const score =
    normEdits * WEIGHTS.editCount +
    normRevert * WEIGHTS.reversionRate +
    normEditors * WEIGHTS.uniqueEditors +
    normRecent * WEIGHTS.recentVelocity

  return Math.round(score * 100)
}

export function getDramaColor(score: number): string {
  if (score >= 70) return 'text-red-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-green-500'
}

export function getDramaBarColor(score: number): string {
  if (score >= 70) return 'bg-red-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-green-500'
}

export function getDramaLabel(score: number): string {
  if (score >= 80) return '🔥 Chaos total'
  if (score >= 60) return '⚡ Très controversé'
  if (score >= 40) return '🌶️ Agité'
  if (score >= 20) return '😐 Calme'
  return '😴 Aucun drama'
}

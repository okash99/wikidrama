import type { ArticleStats } from '../api/wikipedia'

// Plafonds calibrés sur les vrais chiffres XTools
const MAX_REFS = {
  editCount: 10000,    // Donald Trump ~52k, articles moyens ~500-2000
  uniqueEditors: 1000, // grands articles ~500-2000 éditeurs
  recentEdits: 100,    // articles chauds ~50-200 édits/30j
}

const WEIGHTS = {
  editCount:      0.40, // principal différenciateur
  reversionRate:  0.25, // signal fort quand présent
  uniqueEditors:  0.25, // largeur de la controverse
  recentVelocity: 0.10, // actualité récente
}

export function computeDramaScore(stats: ArticleStats): number {
  const normEdits    = Math.min(stats.editCount   / MAX_REFS.editCount,   1)
  const normEditors  = Math.min(stats.uniqueEditors / MAX_REFS.uniqueEditors, 1)
  const normRecent   = Math.min(stats.recentEdits / MAX_REFS.recentEdits,  1)
  const normRevert   = Math.min(stats.reversionRate / 100, 1)

  const raw =
    normEdits   * WEIGHTS.editCount +
    normRevert  * WEIGHTS.reversionRate +
    normEditors * WEIGHTS.uniqueEditors +
    normRecent  * WEIGHTS.recentVelocity

  // Courbe exponentielle pour étaler la distribution (moins de scores autour de 50%)
  const curved = Math.pow(raw, 0.7)

  return Math.round(curved * 100)
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

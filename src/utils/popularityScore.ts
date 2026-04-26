import { E } from './emojis'

export type PopularityTier = 'viral' | 'mondial' | 'tendance' | 'populaire' | 'connu' | 'obscur'

export function getPopularityTier(views: number): PopularityTier {
  if (views >= 5_000_000) return 'viral'
  if (views >= 1_000_000) return 'mondial'
  if (views >=   500_000) return 'tendance'
  if (views >=   100_000) return 'populaire'
  if (views >=    20_000) return 'connu'
  return 'obscur'
}

export function getPopularityLabel(views: number): string {
  const tier = getPopularityTier(views)
  if (tier === 'viral')     return `${E.pvViral} ${E.labelViral}`
  if (tier === 'mondial')   return `${E.pvMondial} ${E.labelMondial}`
  if (tier === 'tendance')  return `${E.pvTendance} ${E.labelTendance}`
  if (tier === 'populaire') return `${E.pvPopulaire} ${E.labelPopulaire}`
  if (tier === 'connu')     return `${E.pvConnu} ${E.labelConnu}`
  return `${E.pvObscur} ${E.labelObscur}`
}

export function getPopularityColor(views: number): string {
  const tier = getPopularityTier(views)
  if (tier === 'viral')     return 'text-purple-300'
  if (tier === 'mondial')   return 'text-yellow-300'
  if (tier === 'tendance')  return 'text-red-400'
  if (tier === 'populaire') return 'text-orange-400'
  if (tier === 'connu')     return 'text-yellow-400'
  return 'text-slate-400'
}

export function getPopularityBarColor(views: number): string {
  const tier = getPopularityTier(views)
  if (tier === 'viral')     return 'bg-purple-400'
  if (tier === 'mondial')   return 'bg-yellow-400'
  if (tier === 'tendance')  return 'bg-red-500'
  if (tier === 'populaire') return 'bg-orange-400'
  if (tier === 'connu')     return 'bg-yellow-400'
  return 'bg-slate-500'
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000)     return `${(views / 1_000).toFixed(0)}k`
  return String(views)
}

// Score normalisé 0-100 pour la barre de progression (log scale)
export function viewsToScore(views: number): number {
  if (views <= 0) return 0
  const MAX_VIEWS = 5_000_000
  const logScore = Math.log10(views + 1) / Math.log10(MAX_VIEWS + 1)
  return Math.min(Math.round(logScore * 100), 100)
}

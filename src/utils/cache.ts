// Versions actives — toute clé wiki_ qui ne commence pas par ces préfixes est supprimée
const ACTIVE_PREFIXES = ['wiki_stats_v10']

export function clearStaleCache(): void {
  try {
    const keysToDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (!key.startsWith('wiki_')) continue
      const isActive = ACTIVE_PREFIXES.some(prefix => key.startsWith(prefix))
      if (!isActive) keysToDelete.push(key)
    }
    keysToDelete.forEach(k => localStorage.removeItem(k))
    if (keysToDelete.length > 0) {
      console.info(`[WikiDrama] Cleared ${keysToDelete.length} stale cache entries`)
    }
  } catch { /* silent — private browsing ou storage bloqué */ }
}

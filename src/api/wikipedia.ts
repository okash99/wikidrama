import { DRAMA_POOL_FLAT, DRAMA_POOL, DRAMA_CATEGORIES } from '../data/drama-articles'

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'
const CACHE_TTL = 1000 * 60 * 30 // 30 min
const DRAMA_SCORE_THRESHOLD = 15

export interface WikiArticle {
  title: string
  extract: string
  thumbnail?: string
  pageId: number
  url: string
}

export interface ArticleStats {
  editCount: number
  uniqueEditors: number
  recentEdits: number
  reversionRate: number
}

export interface ArticleData {
  article: WikiArticle
  stats: ArticleStats
}

// Re-export categories from drama-articles
export { DRAMA_CATEGORIES as CATEGORIES }

// --- Cache ---
function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null }
    return data as T
  } catch { return null }
}

function cacheSet(key: string, data: unknown): void {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) }
  catch { /* silent fail */ }
}

// --- Fetch article summary by title ---
async function fetchSummary(title: string): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/summary/${encodeURIComponent(title)}`)
  if (!res.ok) throw new Error(`Summary fetch failed: ${title}`)
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract?.slice(0, 300) || '',
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// --- Fetch random article summary ---
async function fetchRandomSummary(): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/random/summary`)
  if (!res.ok) throw new Error('Random fetch failed')
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract?.slice(0, 300) || '',
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// --- Fetch article stats ---
export async function fetchArticleStats(title: string): Promise<ArticleStats> {
  const cacheKey = `wiki_stats_${title}`
  const cached = cacheGet<ArticleStats>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvprop: 'ids|timestamp|user|comment',
    rvlimit: '500',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${ACTION_URL}?${params}`)
  if (!res.ok) throw new Error('Stats fetch failed')
  const data = await res.json()

  const pages = data.query?.pages || {}
  const page = Object.values(pages)[0] as any
  const revisions: any[] = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits = revisions.filter(r => new Date(r.timestamp) > thirtyDaysAgo).length
  const uniqueEditors = new Set(revisions.map(r => r.user)).size
  const reverts = revisions.filter(r => {
    const c = (r.comment || '').toLowerCase()
    return c.includes('revert') || c.includes('undo') || c.includes('undid')
  }).length
  const reversionRate = revisions.length > 0 ? Math.round((reverts / revisions.length) * 100) : 0

  const stats: ArticleStats = { editCount: revisions.length, uniqueEditors, recentEdits, reversionRate }
  cacheSet(cacheKey, stats)
  return stats
}

// --- Filtre 1 : vérifier si un article est protégé ---
async function isProtected(title: string): Promise<boolean> {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'info',
    inprop: 'protection',
    titles: title,
    format: 'json',
    origin: '*',
  })
  try {
    const res = await fetch(`${ACTION_URL}?${params}`)
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0] as any
    const protections: any[] = page?.protection || []
    // Garde si l'article a une protection en édition (guerre d'édition détectée)
    return protections.some(p => p.type === 'edit')
  } catch { return false }
}

// --- Fetch article complet avec les 3 filtres ---
import { computeDramaScore } from '../utils/dramaScore'

async function fetchValidatedArticle(title?: string): Promise<ArticleData> {
  const MAX_ATTEMPTS = 3

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // Source : liste blanche si pas de titre fourni, sinon titre direct
      let article: WikiArticle
      if (title) {
        article = await fetchSummary(title)
      } else {
        // Filtre 2 : pioche en priorité dans la liste drama
        const useWhitelist = Math.random() < 0.7 // 70% whitelist, 30% pure random
        if (useWhitelist) {
          const randomTitle = DRAMA_POOL_FLAT[Math.floor(Math.random() * DRAMA_POOL_FLAT.length)]
          article = await fetchSummary(randomTitle)
        } else {
          article = await fetchRandomSummary()
        }
      }

      const stats = await fetchArticleStats(article.title)
      const score = computeDramaScore(stats)

      // Filtre 3 : seuil Drama Score > 15%
      if (score < DRAMA_SCORE_THRESHOLD && !title) {
        continue // retry
      }

      return { article, stats }
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) throw new Error('Failed to fetch article after retries')
    }
  }

  throw new Error('No valid article found')
}

// --- API publique ---

export async function fetchArticleData(): Promise<ArticleData> {
  return fetchValidatedArticle()
}

export async function fetchArticleFromCategory(category: string): Promise<ArticleData> {
  const pool = DRAMA_POOL[category]
  if (!pool || pool.length === 0) return fetchValidatedArticle()

  // Filtre 1 : on essaie d'abord un article protégé de la catégorie
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)

  for (const title of shuffled) {
    try {
      const protected_ = await isProtected(title)
      if (protected_) {
        return await fetchValidatedArticle(title)
      }
    } catch { continue }
  }

  // Fallback : n'importe quel article de la liste
  const randomTitle = pool[Math.floor(Math.random() * pool.length)]
  return fetchValidatedArticle(randomTitle)
}

import { DRAMA_POOL_FLAT, DRAMA_POOL, DRAMA_CATEGORIES } from '../data/drama-articles'
import { computeDramaScore } from '../utils/dramaScore'

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'
const XTOOLS_URL = 'https://xtools.wmcloud.org/api/article/articleinfo/en.wikipedia.org'
const CACHE_TTL = 1000 * 60 * 30
const DRAMA_SCORE_THRESHOLD = 15
const REVISION_CAP = 500 // seuil au-delà duquel on appelle XTools

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
  cappedAt500: boolean // indique si le vrai count a été récupéré via XTools
}

export interface ArticleData {
  article: WikiArticle
  stats: ArticleStats
}

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
  catch { /* silent */ }
}

// --- Fetch summary ---
async function fetchSummary(title: string): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/summary/${encodeURIComponent(title)}`)
  if (!res.ok) throw new Error(`Summary failed: ${title}`)
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract?.slice(0, 300) || '',
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

async function fetchRandomSummary(): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/random/summary`)
  if (!res.ok) throw new Error('Random failed')
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract?.slice(0, 300) || '',
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// --- XTools : récupère le vrai nombre d'éditions total ---
async function fetchXToolsEditCount(title: string): Promise<number | null> {
  try {
    const res = await fetch(`${XTOOLS_URL}/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.revisions ?? null
  } catch { return null }
}

// --- Fetch stats avec fallback XTools si capé ---
export async function fetchArticleStats(title: string): Promise<ArticleStats> {
  const cacheKey = `wiki_stats_v2_${title}`
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
  if (!res.ok) throw new Error('Stats failed')
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
  const reversionRate = revisions.length > 0
    ? Math.round((reverts / revisions.length) * 100)
    : 0

  // Si on a atteint le plafond de 500, on appelle XTools pour le vrai count
  const isCapped = revisions.length >= REVISION_CAP
  let editCount = revisions.length
  let cappedAt500 = false

  if (isCapped) {
    const realCount = await fetchXToolsEditCount(title)
    if (realCount !== null) {
      editCount = realCount
      cappedAt500 = false // on a le vrai chiffre
    } else {
      cappedAt500 = true // XTools a échoué, on indique que c'est >= 500
    }
  }

  const stats: ArticleStats = { editCount, uniqueEditors, recentEdits, reversionRate, cappedAt500 }
  cacheSet(cacheKey, stats)
  return stats
}

// --- Protection check ---
async function isProtected(title: string): Promise<boolean> {
  const params = new URLSearchParams({
    action: 'query', prop: 'info', inprop: 'protection',
    titles: title, format: 'json', origin: '*',
  })
  try {
    const res = await fetch(`${ACTION_URL}?${params}`)
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0] as any
    return (page?.protection || []).some((p: any) => p.type === 'edit')
  } catch { return false }
}

// --- Fetch validé avec les 3 filtres ---
async function fetchValidatedArticle(title?: string): Promise<ArticleData> {
  const MAX_ATTEMPTS = 3
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      let article: WikiArticle
      if (title) {
        article = await fetchSummary(title)
      } else {
        const useWhitelist = Math.random() < 0.7
        article = useWhitelist
          ? await fetchSummary(DRAMA_POOL_FLAT[Math.floor(Math.random() * DRAMA_POOL_FLAT.length)])
          : await fetchRandomSummary()
      }
      const stats = await fetchArticleStats(article.title)
      if (computeDramaScore(stats) < DRAMA_SCORE_THRESHOLD && !title) continue
      return { article, stats }
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) throw new Error('Failed after retries')
    }
  }
  throw new Error('No valid article found')
}

export async function fetchArticleData(): Promise<ArticleData> {
  return fetchValidatedArticle()
}

export async function fetchArticleFromCategory(category: string): Promise<ArticleData> {
  const pool = DRAMA_POOL[category]
  if (!pool || pool.length === 0) return fetchValidatedArticle()
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
  for (const t of shuffled) {
    try {
      if (await isProtected(t)) return await fetchValidatedArticle(t)
    } catch { continue }
  }
  return fetchValidatedArticle(pool[Math.floor(Math.random() * pool.length)])
}

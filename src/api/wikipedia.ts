import { DRAMA_POOL_FLAT, DRAMA_POOL, DRAMA_CATEGORIES, LEGENDARY_POOL, ENORMOUS_POOL } from '../data/drama-articles'
import { computeDramaScore } from '../utils/dramaScore'

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'
const XTOOLS_URL = 'https://xtools.wmcloud.org/api/page/articleinfo/en.wikipedia.org'
const CACHE_TTL = 1000 * 60 * 30
const DRAMA_SCORE_THRESHOLD = 15
const CACHE_VERSION = 'v5' // bump pour invalider les anciens caches

const DRAW_LEGENDARY = 0.10
const DRAW_ENORMOUS  = 0.20
const DRAW_WHITELIST = 0.50

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

export { DRAMA_CATEGORIES as CATEGORIES }

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

async function fetchXToolsEditCount(title: string): Promise<number | null> {
  try {
    const res = await fetch(`${XTOOLS_URL}/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.revisions === 'number' ? data.revisions : null
  } catch { return null }
}

export async function fetchArticleStats(title: string): Promise<ArticleStats> {
  const cacheKey = `wiki_stats_${CACHE_VERSION}_${title}`
  const cached = cacheGet<ArticleStats>(cacheKey)
  if (cached) return cached

  const [xtoolsCount, wikiData] = await Promise.all([
    fetchXToolsEditCount(title),
    fetch(`${ACTION_URL}?${new URLSearchParams({
      action: 'query', prop: 'revisions', titles: title,
      rvprop: 'timestamp|user|comment', rvlimit: '500',
      format: 'json', origin: '*',
    })}`).then(r => r.json()),
  ])

  const pages = wikiData.query?.pages || {}
  const page = Object.values(pages)[0] as any
  const revisions: any[] = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits    = revisions.filter(r => new Date(r.timestamp) > thirtyDaysAgo).length
  const uniqueEditors  = new Set(revisions.map(r => r.user)).size
  const reverts        = revisions.filter(r => {
    const c = (r.comment || '').toLowerCase()
    return c.includes('revert') || c.includes('undo') || c.includes('undid')
  }).length
  const reversionRate  = revisions.length > 0
    ? Math.round((reverts / revisions.length) * 100) : 0

  const editCount = xtoolsCount ?? revisions.length
  const stats: ArticleStats = { editCount, uniqueEditors, recentEdits, reversionRate }
  cacheSet(cacheKey, stats)
  return stats
}

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

function pickSource(): 'legendary' | 'enormous' | 'whitelist' | 'random' {
  const r = Math.random()
  if (r < DRAW_LEGENDARY) return 'legendary'
  if (r < DRAW_LEGENDARY + DRAW_ENORMOUS) return 'enormous'
  if (r < DRAW_LEGENDARY + DRAW_ENORMOUS + DRAW_WHITELIST) return 'whitelist'
  return 'random'
}

async function fetchValidatedArticle(title?: string): Promise<ArticleData> {
  const MAX_ATTEMPTS = 3
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      let article: WikiArticle
      if (title) {
        article = await fetchSummary(title)
      } else {
        const source = pickSource()
        if (source === 'legendary') {
          article = await fetchSummary(LEGENDARY_POOL[Math.floor(Math.random() * LEGENDARY_POOL.length)])
        } else if (source === 'enormous') {
          article = await fetchSummary(ENORMOUS_POOL[Math.floor(Math.random() * ENORMOUS_POOL.length)])
        } else if (source === 'whitelist') {
          article = await fetchSummary(DRAMA_POOL_FLAT[Math.floor(Math.random() * DRAMA_POOL_FLAT.length)])
        } else {
          article = await fetchRandomSummary()
        }
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

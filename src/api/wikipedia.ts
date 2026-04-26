import { DRAMA_POOL_FLAT, DRAMA_POOL, DRAMA_CATEGORIES, LEGENDARY_POOL, ENORMOUS_POOL } from '../data/drama-articles'
import { computeDramaScore } from '../utils/dramaScore'

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'
const XTOOLS_URL = 'https://xtools.wmcloud.org/api/page/articleinfo/en.wikipedia.org'
const CACHE_TTL = 1000 * 60 * 30
const DRAMA_SCORE_THRESHOLD = 15
const CACHE_VERSION = 'v10'

const FETCH_TIMEOUT_MS = 8000
const XTOOLS_TIMEOUT_MS = 6000
const XTOOLS_MAX_RETRIES = 2

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
  anonRate: number
  watchers: number
  minorRate: number
}

export interface ArticleData {
  article: WikiArticle
  stats: ArticleStats
}

export { DRAMA_CATEGORIES as CATEGORIES }

// ─── Cache ─────────────────────────────────────────────────────────────────────────────────────

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
  catch { /* silent — storage full */ }
}

// ─── Fetch helper with timeout ────────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// ─── Wikipedia summary ─────────────────────────────────────────────────────────────────────────────

async function fetchSummary(title: string): Promise<WikiArticle> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/page/summary/${encodeURIComponent(title)}`,
    FETCH_TIMEOUT_MS
  )
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
  const res = await fetchWithTimeout(`${BASE_URL}/page/random/summary`, FETCH_TIMEOUT_MS)
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

// ─── XTools with retry ──────────────────────────────────────────────────────────────────────────

interface XToolsData {
  revisions: number
  editors: number
  anon_edits: number
  minor_edits: number
  watchers: number
}

async function fetchXToolsData(title: string): Promise<XToolsData | null> {
  for (let attempt = 0; attempt < XTOOLS_MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${XTOOLS_URL}/${encodeURIComponent(title)}`,
        XTOOLS_TIMEOUT_MS
      )
      if (!res.ok) {
        if (attempt < XTOOLS_MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
          continue
        }
        return null
      }
      const data = await res.json()
      if (typeof data.revisions !== 'number') return null
      return {
        revisions:   data.revisions,
        editors:     typeof data.editors     === 'number' ? data.editors     : 0,
        anon_edits:  typeof data.anon_edits  === 'number' ? data.anon_edits  : 0,
        minor_edits: typeof data.minor_edits === 'number' ? data.minor_edits : 0,
        watchers:    typeof data.watchers    === 'number' ? data.watchers    : 0,
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError'
      if (isAbort || attempt === XTOOLS_MAX_RETRIES - 1) return null
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
    }
  }
  return null
}

// ─── Article stats ────────────────────────────────────────────────────────────────────────────────────

export async function fetchArticleStats(title: string): Promise<ArticleStats> {
  const cacheKey = `wiki_stats_${CACHE_VERSION}_${title}`
  const cached = cacheGet<ArticleStats>(cacheKey)
  if (cached) return cached

  const wikiUrl = `${ACTION_URL}?${new URLSearchParams({
    action: 'query', prop: 'revisions', titles: title,
    rvprop: 'timestamp|comment|user', rvlimit: '500',
    format: 'json', origin: '*',
  })}`

  const [xtools, wikiData] = await Promise.all([
    fetchXToolsData(title),
    fetchWithTimeout(wikiUrl, FETCH_TIMEOUT_MS).then(r => {
      if (!r.ok) throw new Error('Wiki revisions failed')
      return r.json()
    }),
  ])

  const pages = wikiData.query?.pages || {}
  const page = Object.values(pages)[0] as any
  const revisions: any[] = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits   = revisions.filter(r => new Date(r.timestamp) > thirtyDaysAgo).length
  const reverts       = revisions.filter(r => {
    const c = (r.comment || '').toLowerCase()
    return c.includes('revert') || c.includes('undo') || c.includes('undid')
  }).length
  const reversionRate = revisions.length > 0
    ? Math.round((reverts / revisions.length) * 100) : 0

  const editCount     = xtools?.revisions   ?? revisions.length
  const uniqueEditors = xtools?.editors     ?? new Set(revisions.map((r: any) => r.user)).size
  const anonRate      = xtools && xtools.revisions > 0
    ? Math.round((xtools.anon_edits / xtools.revisions) * 100) / 100
    : 0
  const minorRate     = xtools && xtools.revisions > 0
    ? Math.round((xtools.minor_edits / xtools.revisions) * 100) / 100
    : 0
  const watchers      = xtools?.watchers ?? 0

  const stats: ArticleStats = {
    editCount, uniqueEditors, recentEdits, reversionRate,
    anonRate, watchers, minorRate,
  }
  cacheSet(cacheKey, stats)
  return stats
}

// ─── Protection check ─────────────────────────────────────────────────────────────────────────────

async function isProtected(title: string): Promise<boolean> {
  const params = new URLSearchParams({
    action: 'query', prop: 'info', inprop: 'protection',
    titles: title, format: 'json', origin: '*',
  })
  try {
    const res = await fetchWithTimeout(`${ACTION_URL}?${params}`, FETCH_TIMEOUT_MS)
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0] as any
    return (page?.protection || []).some((p: any) => p.type === 'edit')
  } catch { return false }
}

// ─── Source picker ─────────────────────────────────────────────────────────────────────────────

function pickSource(): 'legendary' | 'enormous' | 'whitelist' | 'random' {
  const r = Math.random()
  if (r < DRAW_LEGENDARY) return 'legendary'
  if (r < DRAW_LEGENDARY + DRAW_ENORMOUS) return 'enormous'
  if (r < DRAW_LEGENDARY + DRAW_ENORMOUS + DRAW_WHITELIST) return 'whitelist'
  return 'random'
}

// ─── Validated article fetch ──────────────────────────────────────────────────────────────────────

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
      if (computeDramaScore(stats) < DRAMA_SCORE_THRESHOLD) {
        if (title) {
          console.warn(`[WikiDrama] Article "${title}" score below threshold, returning anyway`)
          return { article, stats }
        }
        continue
      }
      return { article, stats }
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) throw new Error('Failed after retries')
    }
  }
  throw new Error('No valid article found')
}

// ─── Public API ─────────────────────────────────────────────────────────────────────────────────────

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
  const randomFromPool = pool[Math.floor(Math.random() * pool.length)]
  return fetchValidatedArticle(randomFromPool)
}

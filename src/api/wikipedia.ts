const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

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
  reversionRate: number // Sprint 3: détection via commentaires revert/undo
}

export interface ArticleData {
  article: WikiArticle
  stats: ArticleStats
}

// --- Cache localStorage ---
function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data as T
  } catch {
    return null
  }
}

function cacheSet(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // localStorage full — silent fail
  }
}

// --- Fetch random article summary ---
export async function fetchRandomArticle(): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/random/summary`)
  if (!res.ok) throw new Error('Wikipedia API error')
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract?.slice(0, 200) + '...' || '',
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// --- Fetch article stats (edit count, unique editors, recent edits, reversion rate) ---
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
  if (!res.ok) throw new Error('Wikipedia stats API error')
  const data = await res.json()

  const pages = data.query?.pages || {}
  const page = Object.values(pages)[0] as any
  const revisions: any[] = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits = revisions.filter(
    (r) => new Date(r.timestamp) > thirtyDaysAgo
  ).length

  const uniqueEditors = new Set(revisions.map((r) => r.user)).size

  // Sprint 2: reversion rate via commentaire contenant revert/undo
  const reverts = revisions.filter((r) => {
    const comment = (r.comment || '').toLowerCase()
    return comment.includes('revert') || comment.includes('undo') || comment.includes('undid')
  }).length
  const reversionRate = revisions.length > 0
    ? Math.round((reverts / revisions.length) * 100)
    : 0

  const stats: ArticleStats = {
    editCount: revisions.length,
    uniqueEditors,
    recentEdits,
    reversionRate,
  }

  cacheSet(cacheKey, stats)
  return stats
}

// --- Fetch full article data (article + stats) ---
export async function fetchArticleData(): Promise<ArticleData> {
  const article = await fetchRandomArticle()
  const stats = await fetchArticleStats(article.title)
  return { article, stats }
}

// --- Fetch article from a Wikipedia category ---
export const CATEGORIES: Record<string, string> = {
  'Politique':    'Category:Politics',
  'Sport':        'Category:Sports',
  'Pop Culture':  'Category:Popular_culture',
  'Science':      'Category:Science',
  'Histoire':     'Category:History',
}

export async function fetchArticleFromCategory(category: string): Promise<ArticleData> {
  const wikiCategory = CATEGORIES[category] || 'Category:Politics'
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: wikiCategory,
    cmlimit: '50',
    cmtype: 'page',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${ACTION_URL}?${params}`)
  const data = await res.json()
  const members: any[] = data.query?.categorymembers || []

  if (members.length === 0) return fetchArticleData()

  const random = members[Math.floor(Math.random() * members.length)]
  const summaryRes = await fetch(`${BASE_URL}/page/summary/${encodeURIComponent(random.title)}`)
  const summaryData = await summaryRes.json()

  const article: WikiArticle = {
    title: summaryData.title,
    extract: summaryData.extract?.slice(0, 200) + '...' || '',
    thumbnail: summaryData.thumbnail?.source,
    pageId: summaryData.pageid,
    url: summaryData.content_urls?.desktop?.page || '',
  }

  const stats = await fetchArticleStats(article.title)
  return { article, stats }
}

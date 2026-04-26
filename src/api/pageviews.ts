const PAGEVIEWS_URL = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents'
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6h
const CACHE_VERSION = 'pv1'
const FETCH_TIMEOUT_MS = 8000

export interface PageviewsData {
  title: string
  views: number      // vues sur le mois
  month: string      // ex: 'avril 2026'
}

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

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function getLastMonthTag(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}${m}01`
}

function getLastMonthLabel(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export async function fetchPageviews(title: string): Promise<PageviewsData> {
  const cacheKey = `pv_${CACHE_VERSION}_${title}_${getLastMonthTag()}`
  const cached = cacheGet<PageviewsData>(cacheKey)
  if (cached) return cached

  const tag = getLastMonthTag()
  const url = `${PAGEVIEWS_URL}/${encodeURIComponent(title)}/monthly/${tag}/${tag}`

  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`Pageviews failed: ${title}`)
    const data = await res.json()
    const views: number = data.items?.[0]?.views ?? 0
    const result: PageviewsData = { title, views, month: getLastMonthLabel() }
    cacheSet(cacheKey, result)
    return result
  } catch {
    return { title, views: 0, month: getLastMonthLabel() }
  }
}

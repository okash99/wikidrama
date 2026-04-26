import { DRAMA_POOL_FLAT } from '../data/drama-articles'

const PAGEVIEWS_URL = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents'
const SUMMARY_URL   = 'https://en.wikipedia.org/api/rest_v1/page/summary'
const CACHE_TTL     = 1000 * 60 * 60 * 6 // 6h
const CACHE_VERSION = 'pv1'
const FETCH_TIMEOUT = 8000

export interface PageviewsData {
  title:     string
  views:     number  // vues sur le mois
  month:     string  // ex: 'avril 2026'
  extract:   string
  thumbnail?: string
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
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function getLastMonthTag(): string {
  const now = new Date()
  const d   = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}${m}01`
}

function getLastMonthLabel(): string {
  const now = new Date()
  const d   = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export async function fetchPageviews(title: string): Promise<{ views: number; month: string }> {
  const cacheKey = `pv_${CACHE_VERSION}_${title}_${getLastMonthTag()}`
  const cached   = cacheGet<{ views: number; month: string }>(cacheKey)
  if (cached) return cached

  const tag = getLastMonthTag()
  const url = `${PAGEVIEWS_URL}/${encodeURIComponent(title)}/monthly/${tag}/${tag}`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error()
    const data   = await res.json()
    const views: number = data.items?.[0]?.views ?? 0
    const result = { views, month: getLastMonthLabel() }
    cacheSet(cacheKey, result)
    return result
  } catch {
    return { views: 0, month: getLastMonthLabel() }
  }
}

// Fetch complet pour WikiWars : summary + pageviews en parallele
export async function fetchSummaryForWikiWars(): Promise<PageviewsData> {
  const pool  = DRAMA_POOL_FLAT
  const title = pool[Math.floor(Math.random() * pool.length)]

  const cacheKey = `ww_${CACHE_VERSION}_${title}_${getLastMonthTag()}`
  const cached   = cacheGet<PageviewsData>(cacheKey)
  if (cached) return cached

  const [summaryRes, pv] = await Promise.all([
    fetchWithTimeout(`${SUMMARY_URL}/${encodeURIComponent(title)}`),
    fetchPageviews(title),
  ])

  let extract   = ''
  let thumbnail: string | undefined

  if (summaryRes.ok) {
    const s = await summaryRes.json()
    extract   = s.extract?.slice(0, 300) || ''
    thumbnail = s.thumbnail?.source
  }

  const result: PageviewsData = {
    title,
    views:     pv.views,
    month:     pv.month,
    extract,
    thumbnail,
  }
  cacheSet(cacheKey, result)
  return result
}

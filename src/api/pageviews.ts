import { DRAMA_POOL_FLAT } from '../data/drama-articles'

const PAGEVIEWS_URL = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents'
const SUMMARY_URL   = 'https://en.wikipedia.org/api/rest_v1/page/summary'
const CACHE_TTL     = 1000 * 60 * 60 * 6 // 6h
const CACHE_VERSION = 'pv2'
const FETCH_TIMEOUT = 8000

export interface PageviewsData {
  title:      string
  views:      number   // total sur 12 mois
  period:     string   // ex: 'mai 2025 — avril 2026'
  extract:    string
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

// Retourne YYYYMMDD pour le 1er du mois N mois en arriere
function monthTag(offsetMonths: number): string {
  const now = new Date()
  const d   = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1)
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}${m}01`
}

function monthLabel(offsetMonths: number): string {
  const now = new Date()
  const d   = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

// Fetch pageviews sur 12 mois glissants (somme de tous les items)
export async function fetchPageviews12m(title: string): Promise<{ views: number; period: string }> {
  const start     = monthTag(-12)   // il y a 12 mois
  const end       = monthTag(-1)    // mois dernier
  const cacheKey  = `pv_${CACHE_VERSION}_${title}_${start}_${end}`
  const cached    = cacheGet<{ views: number; period: string }>(cacheKey)
  if (cached) return cached

  const url = `${PAGEVIEWS_URL}/${encodeURIComponent(title)}/monthly/${start}/${end}`

  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data  = await res.json()
    const items: Array<{ views: number }> = data.items ?? []
    const views = items.reduce((sum, item) => sum + (item.views ?? 0), 0)
    const period = `${monthLabel(-12)} — ${monthLabel(-1)}`
    const result = { views, period }
    cacheSet(cacheKey, result)
    return result
  } catch {
    return { views: 0, period: `${monthLabel(-12)} — ${monthLabel(-1)}` }
  }
}

// Fetch complet WikiWars : summary + pageviews 12 mois en parallele
export async function fetchSummaryForWikiWars(): Promise<PageviewsData> {
  const pool  = DRAMA_POOL_FLAT
  const title = pool[Math.floor(Math.random() * pool.length)]

  const start    = monthTag(-12)
  const end      = monthTag(-1)
  const cacheKey = `ww_${CACHE_VERSION}_${title}_${start}_${end}`
  const cached   = cacheGet<PageviewsData>(cacheKey)
  if (cached) return cached

  const [summaryRes, pv] = await Promise.all([
    fetchWithTimeout(`${SUMMARY_URL}/${encodeURIComponent(title)}`),
    fetchPageviews12m(title),
  ])

  let extract   = ''
  let thumbnail: string | undefined

  if (summaryRes.ok) {
    const s   = await summaryRes.json()
    extract   = s.extract?.slice(0, 300) || ''
    thumbnail = s.thumbnail?.source
  }

  const result: PageviewsData = {
    title,
    views:  pv.views,
    period: pv.period,
    extract,
    thumbnail,
  }
  cacheSet(cacheKey, result)
  return result
}

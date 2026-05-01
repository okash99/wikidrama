import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATEGORY_LANG, DRAMA_POOL } from '../data/drama-articles'

type WikiLang = 'en' | 'fr'

type TickerArticle = {
  title: string
  lang: WikiLang
}

type ArticleEditStat = {
  title: string
  count: number | null
}

type TopArticleStat = {
  title: string
  views: number | null
}

type TickerStats = {
  monthEdits: ArticleEditStat
  enEditsLastHour: number | null
  yesterdayEdits: ArticleEditStat
  topArticle: TopArticleStat
}

const TICKER_CACHE_KEY = 'drama_ticker_live_v2'
const TICKER_CACHE_TTL = 1000 * 60 * 2
const FETCH_TIMEOUT_MS = 8000
const REFRESH_MS = 120000
const LIVE_MARKER = '\u{1F534}'
const ARTICLE_POOL: TickerArticle[] = Array.from(
  new Map(
    Object.entries(DRAMA_POOL)
      .flatMap(([category, titles]) => {
        const lang = CATEGORY_LANG[category] ?? 'en'
        return titles.map((title) => ({ title, lang }))
      })
      .map((article) => [`${article.lang}:${article.title}`, article])
  ).values()
)

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > TICKER_CACHE_TTL) {
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
    /* silent */
  }
}

function mergeWithPreviousStats(nextStats: TickerStats, previousStats: TickerStats | null): TickerStats {
  if (!previousStats) return nextStats

  return {
    monthEdits: nextStats.monthEdits.count === null ? previousStats.monthEdits : nextStats.monthEdits,
    enEditsLastHour: nextStats.enEditsLastHour === null ? previousStats.enEditsLastHour : nextStats.enEditsLastHour,
    yesterdayEdits: nextStats.yesterdayEdits.count === null ? previousStats.yesterdayEdits : nextStats.yesterdayEdits,
    topArticle: nextStats.topArticle.views === null ? previousStats.topArticle : nextStats.topArticle,
  }
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

function toWikiTimestamp(date: Date): string {
  return date.toISOString()
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function pickRandomArticles(count: number): TickerArticle[] {
  return [...ARTICLE_POOL]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
}

async function fetchArticleEditCount(article: TickerArticle, start: Date, end: Date): Promise<ArticleEditStat> {
  let count = 0
  let continuation: Record<string, string> = {}

  for (let page = 0; page < 12; page++) {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      titles: article.title,
      rvprop: 'timestamp',
      rvlimit: 'max',
      rvstart: toWikiTimestamp(end),
      rvend: toWikiTimestamp(start),
      redirects: '1',
      format: 'json',
      origin: '*',
      ...continuation,
    })

    const res = await fetchWithTimeout(`https://${article.lang}.wikipedia.org/w/api.php?${params}`)
    if (!res.ok) throw new Error(`Article revisions failed: ${article.title}`)

    const data = await res.json()
    const pages = data.query?.pages || {}

    Object.values(pages).forEach((wikiPage: any) => {
      count += wikiPage.revisions?.length ?? 0
    })

    if (!data.continue) break
    continuation = data.continue
  }

  return { title: article.title, count }
}

async function fetchFirstActiveArticleEditCount(articles: TickerArticle[], start: Date, end: Date): Promise<ArticleEditStat> {
  for (const article of articles.slice(0, 3)) {
    try {
      const stat = await fetchArticleEditCount(article, start, end)
      if (typeof stat.count === 'number' && stat.count > 0) return stat
    } catch {
      /* try another random article */
    }
  }

  return { title: articles[0]?.title ?? 'Wikipedia', count: null }
}

async function fetchEnglishWikipediaEditsLastHour(): Promise<number> {
  const end = new Date()
  const start = new Date(end.getTime() - 60 * 60 * 1000)
  let count = 0
  let continuation: Record<string, string> = {}

  for (let page = 0; page < 40; page++) {
    const params = new URLSearchParams({
      action: 'query',
      list: 'recentchanges',
      rcprop: 'timestamp',
      rctype: 'edit|new',
      rclimit: 'max',
      rcstart: toWikiTimestamp(end),
      rcend: toWikiTimestamp(start),
      format: 'json',
      origin: '*',
      ...continuation,
    })

    const res = await fetchWithTimeout(`https://en.wikipedia.org/w/api.php?${params}`)
    if (!res.ok) throw new Error('Recent changes failed')

    const data = await res.json()
    count += data.query?.recentchanges?.length ?? 0

    if (!data.continue) break
    continuation = data.continue
  }

  return count
}

function isReadableTopArticle(title: string): boolean {
  return Boolean(title)
    && title !== 'Main_Page'
    && !title.startsWith('Special:')
    && !title.startsWith('File:')
    && !title.startsWith('Wikipedia:')
}

async function fetchTopArticleViews(): Promise<TopArticleStat> {
  const today = startOfToday()

  for (let offset = 0; offset > -4; offset--) {
    const date = addDays(today, offset)
    const y = date.getFullYear()
    const m = formatDatePart(date.getMonth() + 1)
    const d = formatDatePart(date.getDate())
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${y}/${m}/${d}`

    try {
      const res = await fetchWithTimeout(url)
      if (!res.ok) continue

      const data = await res.json()
      const articles = data.items?.[0]?.articles ?? []
      const top = articles.find((item: any) => isReadableTopArticle(item.article))

      if (top) {
        return {
          title: String(top.article).replace(/_/g, ' '),
          views: typeof top.views === 'number' ? top.views : null,
        }
      }
    } catch {
      /* try previous day */
    }
  }

  return { title: 'Wikipedia', views: null }
}

async function fetchTickerStats(): Promise<TickerStats> {
  const cached = cacheGet<TickerStats>(TICKER_CACHE_KEY)
  if (cached) return cached

  const randomArticles = pickRandomArticles(10)
  const monthArticles = randomArticles.slice(0, 5)
  const yesterdayArticles = randomArticles.slice(5, 10)
  const monthFallback = monthArticles[0] ?? { title: 'Wikipedia', lang: 'en' as const }
  const yesterdayFallback = yesterdayArticles[0] ?? { title: 'Wikipedia', lang: 'en' as const }
  const todayStart = startOfToday()
  const yesterdayStart = addDays(todayStart, -1)

  const [monthEdits, enEditsLastHour, yesterdayEdits, topArticle] = await Promise.allSettled([
    fetchFirstActiveArticleEditCount(monthArticles, startOfMonth(), new Date()),
    fetchEnglishWikipediaEditsLastHour(),
    fetchFirstActiveArticleEditCount(yesterdayArticles, yesterdayStart, todayStart),
    fetchTopArticleViews(),
  ])

  const stats: TickerStats = {
    monthEdits: monthEdits.status === 'fulfilled'
      ? monthEdits.value
      : { title: monthFallback.title, count: null },
    enEditsLastHour: enEditsLastHour.status === 'fulfilled' ? enEditsLastHour.value : null,
    yesterdayEdits: yesterdayEdits.status === 'fulfilled'
      ? yesterdayEdits.value
      : { title: yesterdayFallback.title, count: null },
    topArticle: topArticle.status === 'fulfilled'
      ? topArticle.value
      : { title: 'Wikipedia', views: null },
  }

  cacheSet(TICKER_CACHE_KEY, stats)
  return stats
}

export default function DramaTicker() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState<TickerStats | null>(null)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const nextStats = await fetchTickerStats()
        if (!cancelled) {
          setStats((previousStats) => mergeWithPreviousStats(nextStats, previousStats))
        }
      } catch (err) {
        console.error('[DramaTicker] Failed', err)
      }
    }

    refresh()
    const interval = setInterval(refresh, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [i18n.language])

  function isDisplayableNumber(value: number | null): value is number {
    return typeof value === 'number' && value > 0
  }

  function formatStat(value: number): string {
    return value.toLocaleString(i18n.language)
  }

  const items: string[] = []

  if (stats && isDisplayableNumber(stats.monthEdits.count)) {
    items.push(t('tickerMonthEdits', {
      live: LIVE_MARKER,
      article: stats.monthEdits.title,
      editCount: formatStat(stats.monthEdits.count),
    }))
  }

  if (stats && isDisplayableNumber(stats.enEditsLastHour)) {
    items.push(t('tickerEnLastHour', {
      live: LIVE_MARKER,
      count: formatStat(stats.enEditsLastHour),
    }))
  }

  if (stats && isDisplayableNumber(stats.yesterdayEdits.count)) {
    items.push(t('tickerYesterdayEdits', {
      live: LIVE_MARKER,
      article: stats.yesterdayEdits.title,
      editCount: formatStat(stats.yesterdayEdits.count),
    }))
  }

  if (stats && isDisplayableNumber(stats.topArticle.views)) {
    items.push(t('tickerTopArticleViews', {
      live: LIVE_MARKER,
      title: stats.topArticle.title,
      views: formatStat(stats.topArticle.views),
    }))
  }

  if (items.length === 0) return null

  const TickerSet = () => (
    <div className="flex items-center shrink-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 mx-8 whitespace-nowrap">
          {item}
          <span className="ml-16 text-white/10 opacity-50">/</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="w-full overflow-hidden bg-black/30 backdrop-blur-sm border-y border-white/5 py-1.5 mb-6 select-none pointer-events-none relative z-0">
      <div className="flex w-max animate-marquee">
        <TickerSet />
        <TickerSet />
      </div>
    </div>
  )
}

import {
  CANONICAL_TITLES,
  DRAMA_POOL,
  DRAMA_POOL_ENTRIES,
  DRAMA_CATEGORIES,
  CATEGORY_LANG,
  type DramaPoolEntry,
  type WikiLang,
} from '../data/drama-articles'
import { getCategoryPoolKey } from '../data/categories'
import { computeDramaScore } from '../utils/dramaScore'

const CACHE_TTL = 1000 * 60 * 30
const DRAMA_SCORE_THRESHOLD = 15
const CACHE_VERSION = 'v13'

const FETCH_TIMEOUT_MS = 8000
const XTOOLS_TIMEOUT_MS = 6000
const XTOOLS_MAX_RETRIES = 2

const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php'
const WIKIDATA_ENTITY_URL = 'https://www.wikidata.org/wiki/Special:EntityData'

const CATEGORY_FALLBACK_TITLES: Record<string, { title: string; lang: WikiLang }> = {
  Politique: { title: 'United Nations', lang: 'en' },
  Sport: { title: 'Association football', lang: 'en' },
  'Pop Culture': { title: 'Popular culture', lang: 'en' },
  Science: { title: 'Science', lang: 'en' },
  Histoire: { title: 'History', lang: 'en' },
  Religion: { title: 'Religion', lang: 'en' },
  Tech: { title: 'Technology', lang: 'en' },
  'YouTubeurs FR': { title: 'Vidéaste web', lang: 'fr' },
  'YouTubeurs US': { title: 'YouTuber', lang: 'en' },
  Divers: { title: 'Internet meme', lang: 'en' },
  Pays: { title: 'Earth', lang: 'en' },
  'Jeux Vidéo': { title: 'Video game', lang: 'en' },
  Philosophy: { title: 'Philosophy', lang: 'en' },
}

const DEFAULT_CATEGORY_FALLBACK = { title: 'Wikipedia', lang: 'en' as const }

export interface WikiArticle {
  title: string
  extract: string
  thumbnail?: string
  imageSource?: ImageSource
  pageId: number
  url: string
}

export type ImageSource = 'summary' | 'pageimages' | 'wikidata' | 'commons' | 'categoryFallback'

export interface ArticleStats {
  editCount: number
  uniqueEditors: number
  recentEdits: number
  reversionRate: number
  anonRate: number
  watchers: number
  minorRate: number
  protected: boolean
}

export interface ArticleData {
  article: WikiArticle
  stats: ArticleStats
}

export interface SummaryData {
  title: string
  extract?: string
  thumbnail?: { source?: string }
  pageid: number
  content_urls?: { desktop?: { page?: string } }
}

interface MediaWikiPage {
  pageid?: number
  title?: string
  missing?: boolean
  thumbnail?: { source?: string }
  original?: { source?: string }
  pageprops?: {
    disambiguation?: string
    wikibase_item?: string
  }
  fullurl?: string
}

interface PageImageResult {
  thumbnail?: string
  wikibaseItem?: string
  isDisambiguation: boolean
}

interface CommonsImageInfo {
  url?: string
  thumburl?: string
  mime?: string
}

interface CommonsPage {
  title?: string
  imageinfo?: CommonsImageInfo[]
}

interface ImageResolution {
  thumbnail?: string
  imageSource?: ImageSource
}

export { DRAMA_CATEGORIES as CATEGORIES }

const COMMONS_REJECTED_TITLE_PATTERN =
  /\b(logo|icon|map|flag|diagram|chart|seal|crest|coat of arms|wordmark|banner|emblem|symbol|poster|cover(?:\s*art)?|album art|book cover|game cover)\b/i

const TRAILING_EVENT_WORDS = new Set([
  'scandal',
  'scandals',
  'controversy',
  'controversies',
  'incident',
  'incidents',
  'case',
  'cases',
  'affair',
  'affairs',
  'allegation',
  'allegations',
  'abuse',
  'crisis',
  'disaster',
  'protest',
  'protests',
  'movement',
  'campaign',
  'hoax',
  'challenge',
  'debate',
  'strike',
  'boycott',
  'riot',
  'riots',
  'massacre',
  'war',
  'fraud',
  'match',
  'halftime',
  'show',
  'episode',
  'stabbing',
  'shooting',
  'murder',
  'death',
  'attack',
  'attacks',
])

const TRAILING_QUALIFIER_WORDS = new Set([
  'child',
  'children',
  'sex',
  'sexual',
  'domestic',
  'drug',
  'drugs',
  'doping',
  'steroid',
  'steroids',
  'assault',
  'assaults',
  'harassment',
  'email',
  'emails',
  'vote',
  'voting',
  'fixing',
])

const GENERIC_LEADING_TOPICS = new Set([
  'doping',
  'steroids',
  'murder',
  'death',
  'shooting',
  'attack',
  'attacks',
  'riot',
  'riots',
  'massacre',
  'controversy',
  'controversies',
  'scandal',
  'scandals',
  'fraud',
  'abuse',
  'war',
])

// ─── Lang helpers ─────────────────────────────────────────────────────────────

function getLang(category?: string): WikiLang {
  if (!category) return 'en'
  return CATEGORY_LANG[getCategoryPoolKey(category)] ?? 'en'
}

function getUrls(lang: WikiLang) {
  return {
    base:   `https://${lang}.wikipedia.org/api/rest_v1`,
    action: `https://${lang}.wikipedia.org/w/api.php`,
    xtools: `https://xtools.wmcloud.org/api/page/articleinfo/${lang}.wikipedia.org`,
  }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

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

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function getCanonicalTitle(title: string, lang: WikiLang): string {
  return CANONICAL_TITLES[`${lang}:${title}`] ?? title
}

function pickPoolEntry(): DramaPoolEntry {
  return DRAMA_POOL_ENTRIES[Math.floor(Math.random() * DRAMA_POOL_ENTRIES.length)]
}

function commonsFileUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=960`
}

async function fetchPageImage(title: string, lang: WikiLang): Promise<PageImageResult | null> {
  const { action } = getUrls(lang)
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'pageimages|pageprops|info',
    piprop: 'thumbnail|original|name',
    pithumbsize: '960',
    inprop: 'url',
    titles: title,
  })

  try {
    const res = await fetchWithTimeout(`${action}?${params}`, FETCH_TIMEOUT_MS)
    if (!res.ok) return null
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0] as MediaWikiPage | undefined
    if (!page || page.missing) return null

    return {
      thumbnail: page.thumbnail?.source ?? page.original?.source,
      wikibaseItem: page.pageprops?.wikibase_item,
      isDisambiguation: page.pageprops?.disambiguation !== undefined,
    }
  } catch {
    return null
  }
}

async function fetchWikidataImage(wikibaseItem?: string): Promise<string | null> {
  if (!wikibaseItem) return null

  try {
    const res = await fetchWithTimeout(`${WIKIDATA_ENTITY_URL}/${wikibaseItem}.json`, FETCH_TIMEOUT_MS)
    if (!res.ok) return null
    const data = await res.json()
    const claim = data.entities?.[wikibaseItem]?.claims?.P18?.[0]
    const fileName = claim?.mainsnak?.datavalue?.value
    return typeof fileName === 'string' ? commonsFileUrl(fileName) : null
  } catch {
    return null
  }
}

function scoreCommonsCandidate(query: string, page: CommonsPage): number {
  const title = (page.title ?? '').replace(/^File:/, '').toLowerCase()
  const normalizedQuery = query.toLowerCase()
  const imageInfo = page.imageinfo?.[0]
  const mime = imageInfo?.mime ?? ''
  if (isRejectedCommonsCandidate(query, page)) return Number.NEGATIVE_INFINITY
  let score = 0

  for (const token of normalizedQuery.split(/\s+/).filter((part) => part.length > 2)) {
    if (title.includes(token)) score += 3
  }
  if (title.includes(normalizedQuery)) score += 8
  if (title.startsWith(normalizedQuery)) score += 4
  if (mime === 'image/jpeg') score += 3
  else if (mime === 'image/png') score -= 1
  else if (mime.startsWith('image/')) score += 1
  return score
}

function countMatchedQueryTokens(query: string, normalizedTitle: string): number {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .filter((token) => normalizedTitle.includes(token)).length
}

function isRejectedCommonsCandidate(query: string, page: CommonsPage): boolean {
  const rawTitle = (page.title ?? '').replace(/^File:/, '')
  const normalizedTitle = rawTitle.toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()
  const mime = page.imageinfo?.[0]?.mime ?? ''
  const queryTokens = normalizedQuery.split(/\s+/).filter((part) => part.length > 2)
  const matchedTokens = countMatchedQueryTokens(query, normalizedTitle)

  if (!mime.startsWith('image/')) return true
  if (mime === 'image/svg+xml') return true
  if (COMMONS_REJECTED_TITLE_PATTERN.test(normalizedTitle)) return true
  if (queryTokens.length >= 3 && matchedTokens < 2) return true
  if (queryTokens.length >= 2 && matchedTokens === 0) return true

  if (
    mime === 'image/png' &&
    normalizedQuery.length > 0 &&
    (normalizedTitle.startsWith(`${normalizedQuery}-`) || normalizedTitle.startsWith(`${normalizedQuery} -`))
  ) {
    return true
  }

  return false
}

async function fetchCommonsImage(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: '8',
    gsrsearch: query,
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '960',
  })

  try {
    const res = await fetchWithTimeout(`${COMMONS_API_URL}?${params}`, FETCH_TIMEOUT_MS)
    if (!res.ok) return null
    const data = await res.json()
    const pages = Object.values(data.query?.pages || {}) as CommonsPage[]
    const best = pages
      .map((page) => ({ page, score: scoreCommonsCandidate(query, page) }))
      .filter(({ score }) => Number.isFinite(score) && score > 0)
      .sort((a, b) => b.score - a.score)[0]?.page

    return best?.imageinfo?.[0]?.thumburl ?? best?.imageinfo?.[0]?.url ?? null
  } catch {
    return null
  }
}

async function fetchCategoryFallbackImage(category?: string): Promise<string | null> {
  const fallback = category ? CATEGORY_FALLBACK_TITLES[category] : undefined
  const { title, lang } = fallback ?? DEFAULT_CATEGORY_FALLBACK
  const pageImage = await fetchPageImage(title, lang)
  if (pageImage?.thumbnail) return pageImage.thumbnail
  return fetchWikidataImage(pageImage?.wikibaseItem)
}

async function fetchBestSearchTitle(title: string, lang: WikiLang): Promise<string | null> {
  const { action } = getUrls(lang)
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    list: 'search',
    srnamespace: '0',
    srlimit: '1',
    srsearch: title,
  })

  try {
    const res = await fetchWithTimeout(`${action}?${params}`, FETCH_TIMEOUT_MS)
    if (!res.ok) return null
    const data = await res.json()
    const best = data.query?.search?.[0]?.title
    return typeof best === 'string' ? best : null
  } catch {
    return null
  }
}

/**
 * Simplify a title to its core subject for a broader Commons search.
 * Strips event/scandal suffixes, parenthetical disambiguations, and
 * prepositional clauses to extract the main noun (person, place, thing).
 */
function simplifySearchQuery(title: string): string[] {
  const candidates: string[] = []
  const addCandidate = (value?: string | null) => {
    const normalized = value
      ?.replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/[,:;]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!normalized || normalized.length < 3 || normalized === title || candidates.includes(normalized)) return
    candidates.push(normalized)
  }

  const isCapitalizedWord = (word: string) => {
    const cleaned = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'.-]+$/gu, '')
    return /^[A-ZÀ-ÖØ-Þ][\p{L}\p{N}'’.:-]*$/u.test(cleaned) || /^[A-Z]{2,}$/.test(cleaned)
  }

  const trimTrailingNoise = (value: string) => {
    const words = value.split(/\s+/)
    let removedEventWord = false

    while (words.length > 1) {
      const last = words[words.length - 1].toLowerCase()
      if (TRAILING_EVENT_WORDS.has(last)) {
        words.pop()
        removedEventWord = true
        continue
      }
      if (removedEventWord && TRAILING_QUALIFIER_WORDS.has(last)) {
        words.pop()
        continue
      }
      break
    }

    return words.join(' ').trim()
  }

  const noParens = title.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  const words = noParens.split(/\s+/)

  if (words.length >= 2 && isCapitalizedWord(words[0]) && isCapitalizedWord(words[1])) {
    addCandidate(words.slice(0, 2).join(' '))
  }

  const stripped = trimTrailingNoise(noParens)
  if (stripped !== noParens) {
    addCandidate(stripped)
  }

  const prepMatch = noParens.match(/^(.+?)\s+(in|at the|at|of|vs\.?|v\.)\s+(.+)$/i)
  if (prepMatch) {
    const [, beforeRaw, relation, afterRaw] = prepMatch
    const before = trimTrailingNoise(beforeRaw.trim())
    const after = trimTrailingNoise(afterRaw.trim())
    const lead = before.split(/\s+/)[0]?.toLowerCase()

    if (relation.toLowerCase() === 'of' || GENERIC_LEADING_TOPICS.has(lead)) {
      addCandidate(after)
      addCandidate(before)
    } else {
      addCandidate(after)
      addCandidate(before)
    }
  }

  if (noParens !== title) {
    addCandidate(noParens)
  }

  return candidates
}

export async function resolveArticleImage(
  title: string,
  lang: WikiLang,
  summaryData: SummaryData,
  category?: string
): Promise<ImageResolution> {
  const cacheKey = `wiki_image_${CACHE_VERSION}_${lang}_${category ?? 'none'}_${title}`
  const cached = cacheGet<ImageResolution>(cacheKey)
  if (cached?.thumbnail) return cached

  if (summaryData.thumbnail?.source) {
    const result = { thumbnail: summaryData.thumbnail.source, imageSource: 'summary' as const }
    cacheSet(cacheKey, result)
    return result
  }

  const pageImage = await fetchPageImage(summaryData.title, lang)
  if (pageImage?.thumbnail && !pageImage.isDisambiguation) {
    const result = { thumbnail: pageImage.thumbnail, imageSource: 'pageimages' as const }
    cacheSet(cacheKey, result)
    return result
  }

  if (!pageImage?.isDisambiguation) {
    const wikidataImage = await fetchWikidataImage(pageImage?.wikibaseItem)
    if (wikidataImage) {
      const result = { thumbnail: wikidataImage, imageSource: 'wikidata' as const }
      cacheSet(cacheKey, result)
      return result
    }

    const commonsImage = await fetchCommonsImage(summaryData.title)
    if (commonsImage) {
      const result = { thumbnail: commonsImage, imageSource: 'commons' as const }
      cacheSet(cacheKey, result)
      return result
    }

    // Simplified Commons search: try shorter queries derived from the title
    const simplifiedQueries = simplifySearchQuery(summaryData.title)
    for (const query of simplifiedQueries) {
      const simplifiedImage = await fetchCommonsImage(query)
      if (simplifiedImage) {
        const result = { thumbnail: simplifiedImage, imageSource: 'commons' as const }
        cacheSet(cacheKey, result)
        return result
      }
    }
  }

  const fallbackImage = await fetchCategoryFallbackImage(category)
  if (fallbackImage) {
    const result = { thumbnail: fallbackImage, imageSource: 'categoryFallback' as const }
    cacheSet(cacheKey, result)
    return result
  }

  return {}
}

// ─── Wikipedia summary ────────────────────────────────────────────────────────

async function fetchSummary(title: string, lang: WikiLang = 'en', category?: string): Promise<WikiArticle> {
  const { base } = getUrls(lang)
  let summaryTitle = getCanonicalTitle(title, lang)
  let res = await fetchWithTimeout(
    `${base}/page/summary/${encodeURIComponent(summaryTitle)}`,
    FETCH_TIMEOUT_MS
  )

  if (!res.ok) {
    const searchTitle = await fetchBestSearchTitle(title, lang)
    if (searchTitle && searchTitle !== summaryTitle) {
      summaryTitle = searchTitle
      res = await fetchWithTimeout(
        `${base}/page/summary/${encodeURIComponent(summaryTitle)}`,
        FETCH_TIMEOUT_MS
      )
    }
  }

  if (!res.ok) throw new Error(`Summary failed: ${title}`)
  const data = await res.json() as SummaryData
  const image = await resolveArticleImage(title, lang, data, category)
  return {
    title: data.title,
    extract: data.extract?.slice(0, 300) || '',
    thumbnail: image.thumbnail,
    imageSource: image.imageSource,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// ─── XTools ───────────────────────────────────────────────────────────────────

interface XToolsData {
  revisions: number
  editors: number
  anon_edits: number
  minor_edits: number
  watchers: number
}

async function fetchXToolsData(title: string, lang: WikiLang = 'en'): Promise<XToolsData | null> {
  const { xtools } = getUrls(lang)
  for (let attempt = 0; attempt < XTOOLS_MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${xtools}/${encodeURIComponent(title)}`,
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

// ─── REST API history counts (fallback for XTools) ────────────────────────────

async function fetchEditCounts(
  title: string,
  lang: WikiLang = 'en'
): Promise<{ edits: number; editors: number }> {
  const base = `https://${lang}.wikipedia.org/w/rest.php/v1/page`
  const encoded = encodeURIComponent(title)
  try {
    const [editsRes, editorsRes] = await Promise.all([
      fetchWithTimeout(`${base}/${encoded}/history/counts/edits`, FETCH_TIMEOUT_MS),
      fetchWithTimeout(`${base}/${encoded}/history/counts/editors`, FETCH_TIMEOUT_MS),
    ])
    const edits  = editsRes.ok  ? await editsRes.json()  : { count: 0 }
    const editors = editorsRes.ok ? await editorsRes.json() : { count: 0 }
    return { edits: edits.count ?? 0, editors: editors.count ?? 0 }
  } catch {
    return { edits: 0, editors: 0 }
  }
}

// ─── Protection check ─────────────────────────────────────────────────────────

async function fetchProtected(title: string, lang: WikiLang = 'en'): Promise<boolean> {
  const { action } = getUrls(lang)
  const params = new URLSearchParams({
    action: 'query', prop: 'info', inprop: 'protection',
    titles: title, format: 'json', origin: '*',
  })
  try {
    const res = await fetchWithTimeout(`${action}?${params}`, FETCH_TIMEOUT_MS)
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0] as { protection?: { type: string }[] }
    return (page?.protection || []).some((p) => p.type === 'edit')
  } catch { return false }
}

// ─── Article stats ────────────────────────────────────────────────────────────

export async function fetchArticleStats(title: string, lang: WikiLang = 'en'): Promise<ArticleStats> {
  const cacheKey = `wiki_stats_${CACHE_VERSION}_${lang}_${title}`
  const cached = cacheGet<ArticleStats>(cacheKey)
  if (cached) return cached

  const { action } = getUrls(lang)
  const wikiUrl = `${action}?${new URLSearchParams({
    action: 'query', prop: 'revisions', titles: title,
    rvprop: 'timestamp|comment|user', rvlimit: '500',
    format: 'json', origin: '*',
  })}`

  const [xtools, wikiData, isProtectedResult, restCounts] = await Promise.all([
    fetchXToolsData(title, lang),
    fetchWithTimeout(wikiUrl, FETCH_TIMEOUT_MS).then(r => {
      if (!r.ok) throw new Error('Wiki revisions failed')
      return r.json()
    }),
    fetchProtected(title, lang),
    fetchEditCounts(title, lang),
  ])

  const pages = wikiData.query?.pages || {}
  const page = Object.values(pages)[0] as { revisions?: { timestamp: string; comment?: string; user?: string }[] }
  const revisions = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits   = revisions.filter(r => new Date(r.timestamp) > thirtyDaysAgo).length
  const reverts       = revisions.filter(r => {
    const c = (r.comment || '').toLowerCase()
    return c.includes('revert') || c.includes('annul') || c.includes('undo') || c.includes('undid')
  }).length
  const reversionRate = revisions.length > 0
    ? Math.round((reverts / revisions.length) * 100) : 0

  const editCount     = (xtools?.revisions   ?? restCounts.edits)   || revisions.length
  const uniqueEditors = (xtools?.editors     ?? restCounts.editors) || new Set(revisions.map(r => r.user)).size
  const anonRate      = xtools && xtools.revisions > 0
    ? Math.round((xtools.anon_edits / xtools.revisions) * 100) / 100 : 0
  const minorRate     = xtools && xtools.revisions > 0
    ? Math.round((xtools.minor_edits / xtools.revisions) * 100) / 100 : 0
  const watchers      = xtools?.watchers ?? 0

  const stats: ArticleStats = {
    editCount, uniqueEditors, recentEdits, reversionRate,
    anonRate, watchers, minorRate,
    protected: isProtectedResult,
  }
  cacheSet(cacheKey, stats)
  return stats
}

// ─── Validated article fetch ──────────────────────────────────────────────────

async function fetchValidatedArticle(title?: string, lang: WikiLang = 'en', category?: string): Promise<ArticleData> {
  const MAX_ATTEMPTS = 3
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      let article: WikiArticle
      let articleLang = lang
      if (title) {
        article = await fetchSummary(title, lang, category)
      } else {
        const entry = pickPoolEntry()
        article = await fetchSummary(entry.title, entry.lang, entry.category)
        articleLang = entry.lang
      }
      const stats = await fetchArticleStats(article.title, articleLang)
      if (computeDramaScore(stats) < DRAMA_SCORE_THRESHOLD) {
        if (title) {
          console.warn(`[WikiDrama] "${title}" score below threshold, returning anyway`)
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchArticleData(): Promise<ArticleData> {
  return fetchValidatedArticle()
}

export async function fetchArticleFromCategory(category: string): Promise<ArticleData> {
  const poolKey = getCategoryPoolKey(category)
  const pool = DRAMA_POOL[poolKey]
  if (!pool || pool.length === 0) return fetchValidatedArticle()
  const lang = getLang(poolKey)
  const title = pool[Math.floor(Math.random() * pool.length)]
  return fetchValidatedArticle(title, lang, poolKey)
}

export async function fetchArticleByTitle(title: string, lang: WikiLang = 'en'): Promise<ArticleData> {
  return fetchValidatedArticle(title, lang)
}

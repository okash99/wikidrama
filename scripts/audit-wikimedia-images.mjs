import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const FETCH_TIMEOUT_MS = 10000
const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php'
const WIKIDATA_ENTITY_URL = 'https://www.wikidata.org/wiki/Special:EntityData'

const CATEGORY_FALLBACK_TITLES = {
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

const DEFAULT_CATEGORY_FALLBACK = { title: 'Wikipedia', lang: 'en' }

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

function loadDramaData() {
  const source = fs.readFileSync('src/data/drama-articles.ts', 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const moduleObj = { exports: {} }
  new Function('exports', 'require', 'module', '__filename', '__dirname', js)(
    moduleObj.exports,
    require,
    moduleObj,
    'src/data/drama-articles.ts',
    'src/data'
  )
  return moduleObj.exports
}

function getUrls(lang) {
  return {
    base: `https://${lang}.wikipedia.org/api/rest_v1`,
    action: `https://${lang}.wikipedia.org/w/api.php`,
  }
}

function getCanonicalTitle(title, lang, canonicalTitles) {
  return canonicalTitles[`${lang}:${title}`] ?? title
}

function commonsFileUrl(fileName) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=960`
}

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJson(url, attempt = 0) {
  const res = await fetchWithTimeout(url)
  if (res.status === 429 && attempt < 4) {
    const retryAfter = Number(res.headers.get('retry-after') || 15)
    await new Promise((resolve) => setTimeout(resolve, (retryAfter + 3) * 1000))
    return fetchJson(url, attempt + 1)
  }
  if (!res.ok) return null
  return res.json()
}

async function fetchBestSearchTitle(title, lang) {
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
  const data = await fetchJson(`${action}?${params}`)
  const best = data?.query?.search?.[0]?.title
  return typeof best === 'string' ? best : null
}

async function fetchSummary(title, lang, canonicalTitles) {
  const { base } = getUrls(lang)
  let requestedTitle = getCanonicalTitle(title, lang, canonicalTitles)
  let res = await fetchWithTimeout(`${base}/page/summary/${encodeURIComponent(requestedTitle)}`)

  if (!res.ok) {
    const searchTitle = await fetchBestSearchTitle(title, lang)
    if (searchTitle && searchTitle !== requestedTitle) {
      requestedTitle = searchTitle
      res = await fetchWithTimeout(`${base}/page/summary/${encodeURIComponent(requestedTitle)}`)
    }
  }

  if (!res.ok) return { status: `summary:${res.status}`, requestedTitle }
  const data = await res.json()
  return { status: 'ok', requestedTitle, data }
}

async function fetchPageImage(title, lang) {
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
  const data = await fetchJson(`${action}?${params}`)
  const page = Object.values(data?.query?.pages ?? {})[0]
  if (!page || page.missing) return null
  return {
    thumbnail: page.thumbnail?.source ?? page.original?.source,
    wikibaseItem: page.pageprops?.wikibase_item,
    isDisambiguation: page.pageprops?.disambiguation !== undefined,
  }
}

async function fetchWikidataImage(wikibaseItem) {
  if (!wikibaseItem) return null
  const data = await fetchJson(`${WIKIDATA_ENTITY_URL}/${wikibaseItem}.json`)
  const fileName = data?.entities?.[wikibaseItem]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
  return typeof fileName === 'string' ? commonsFileUrl(fileName) : null
}

function scoreCommonsCandidate(query, page) {
  const title = (page.title ?? '').replace(/^File:/, '').toLowerCase()
  const normalizedQuery = query.toLowerCase()
  const mime = page.imageinfo?.[0]?.mime ?? ''
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

function countMatchedQueryTokens(query, normalizedTitle) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .filter((token) => normalizedTitle.includes(token)).length
}

function isRejectedCommonsCandidate(query, page) {
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

async function fetchCommonsImage(query) {
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
  const data = await fetchJson(`${COMMONS_API_URL}?${params}`)
  const pages = Object.values(data?.query?.pages ?? {})
  const best = pages
    .map((page) => ({ page, score: scoreCommonsCandidate(query, page) }))
    .filter(({ score }) => Number.isFinite(score) && score > 0)
    .sort((a, b) => b.score - a.score)[0]?.page
  return best?.imageinfo?.[0]?.thumburl ?? best?.imageinfo?.[0]?.url ?? null
}

function simplifySearchQuery(title) {
  const candidates = []

  const addCandidate = (value) => {
    const normalized = value
      ?.replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/[,:;]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!normalized || normalized.length < 3 || normalized === title || candidates.includes(normalized)) return
    candidates.push(normalized)
  }

  const isCapitalizedWord = (word) => {
    const cleaned = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'.-]+$/gu, '')
    return /^[A-ZÀ-ÖØ-Þ][\p{L}\p{N}'’.:-]*$/u.test(cleaned) || /^[A-Z]{2,}$/.test(cleaned)
  }

  const trimTrailingNoise = (value) => {
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

async function fetchCategoryFallbackImage(category) {
  const fallback = CATEGORY_FALLBACK_TITLES[category] ?? DEFAULT_CATEGORY_FALLBACK
  const pageImage = await fetchPageImage(fallback.title, fallback.lang)
  if (pageImage?.thumbnail) return pageImage.thumbnail
  return fetchWikidataImage(pageImage?.wikibaseItem)
}

async function resolveImage(entry, canonicalTitles) {
  const summary = await fetchSummary(entry.title, entry.lang, canonicalTitles)
  if (!summary.data) {
    return { ...entry, canonicalTitle: summary.requestedTitle, status: summary.status, imageSource: 'missing', imageUrl: '' }
  }

  if (summary.data.thumbnail?.source) {
    return { ...entry, canonicalTitle: summary.data.title, status: 'ok', imageSource: 'summary', imageUrl: summary.data.thumbnail.source }
  }

  const pageImage = await fetchPageImage(summary.data.title, entry.lang)
  if (pageImage?.thumbnail && !pageImage.isDisambiguation) {
    return { ...entry, canonicalTitle: summary.data.title, status: 'ok', imageSource: 'pageimages', imageUrl: pageImage.thumbnail }
  }

  if (!pageImage?.isDisambiguation) {
    const wikidataImage = await fetchWikidataImage(pageImage?.wikibaseItem)
    if (wikidataImage) return { ...entry, canonicalTitle: summary.data.title, status: 'ok', imageSource: 'wikidata', imageUrl: wikidataImage }

    const commonsImage = await fetchCommonsImage(summary.data.title)
    if (commonsImage) return { ...entry, canonicalTitle: summary.data.title, status: 'ok', imageSource: 'commons', imageUrl: commonsImage }

    const simplifiedQueries = simplifySearchQuery(summary.data.title)
    for (const query of simplifiedQueries) {
      const simplifiedImage = await fetchCommonsImage(query)
      if (simplifiedImage) {
        return {
          ...entry,
          canonicalTitle: summary.data.title,
          status: `ok:simplified:${query}`,
          imageSource: 'commons',
          imageUrl: simplifiedImage,
        }
      }
    }
  }

  const fallbackImage = await fetchCategoryFallbackImage(entry.category)
  return {
    ...entry,
    canonicalTitle: summary.data.title,
    status: pageImage?.isDisambiguation ? 'disambiguation-fallback' : 'fallback',
    imageSource: fallbackImage ? 'categoryFallback' : 'missing',
    imageUrl: fallbackImage ?? '',
  }
}

async function main() {
  const { DRAMA_POOL_ENTRIES, CANONICAL_TITLES } = loadDramaData()
  const categoryArg = process.argv.find((arg) => arg.startsWith('--category='))?.slice('--category='.length)
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.slice('--limit='.length)
  const limit = limitArg ? Number(limitArg) : undefined
  const entries = DRAMA_POOL_ENTRIES
    .filter((entry) => !categoryArg || entry.category === categoryArg)
    .slice(0, Number.isFinite(limit) ? limit : undefined)

  const rows = []
  for (const entry of entries) {
    rows.push(await resolveImage(entry, CANONICAL_TITLES))
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  const counts = rows.reduce((acc, row) => {
    acc[row.imageSource] = (acc[row.imageSource] ?? 0) + 1
    return acc
  }, {})

  console.table(rows.map(({ category, lang, title, canonicalTitle, imageSource, status, imageUrl }) => ({
    category,
    lang,
    title,
    canonicalTitle,
    imageSource,
    status,
    imageUrl,
  })))
  console.log(JSON.stringify({ total: rows.length, counts }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

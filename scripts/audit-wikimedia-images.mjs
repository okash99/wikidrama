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
  'YouTubeurs FR': { title: 'YouTube', lang: 'fr' },
  'YouTubeurs US': { title: 'YouTube', lang: 'en' },
}

const DEFAULT_CATEGORY_FALLBACK = { title: 'Wikipedia', lang: 'en' }

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
  let score = 0

  for (const token of normalizedQuery.split(/\s+/).filter((part) => part.length > 2)) {
    if (title.includes(token)) score += 3
  }
  if (title.includes(normalizedQuery)) score += 8
  if (mime.startsWith('image/')) score += 2
  if (mime === 'image/svg+xml') score -= 3
  if (/(logo|icon|map|flag|diagram|chart|seal)/i.test(title)) score -= 2
  return score
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
    .filter(({ page, score }) => score > 0 && page.imageinfo?.[0]?.mime?.startsWith('image/'))
    .sort((a, b) => b.score - a.score)[0]?.page
  return best?.imageinfo?.[0]?.thumburl ?? best?.imageinfo?.[0]?.url ?? null
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

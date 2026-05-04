import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

async function testFallback(title, lang) {
  const action = `https://${lang}.wikipedia.org/w/api.php`
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

  const res = await fetch(`${action}?${params}`)
  const data = await res.json()
  const pages = data.query?.pages || {}
  const page = Object.values(pages)[0]
  
  let thumb = page?.thumbnail?.source ?? page?.original?.source
  let wikibaseItem = page?.pageprops?.wikibase_item
  
  let wdThumb = null
  if (!thumb && wikibaseItem) {
    const wdRes = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikibaseItem}.json`)
    if (wdRes.ok) {
      const wdData = await wdRes.json()
      const claim = wdData.entities?.[wikibaseItem]?.claims?.P18?.[0]
      const fileName = claim?.mainsnak?.datavalue?.value
      if (fileName) {
        wdThumb = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=960`
      }
    }
  }

  console.log(`[FALLBACK TEST] ${category} | ${title} (${lang}) -> PageImage: ${!!thumb} | WikiData: ${!!wdThumb}`)
}

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
  Divers: { title: 'Wikipedia', lang: 'en' },
}

async function main() {
  for (const [cat, fallback] of Object.entries(CATEGORY_FALLBACK_TITLES)) {
    global.category = cat
    await testFallback(fallback.title, fallback.lang)
  }
}
main().catch(console.error)

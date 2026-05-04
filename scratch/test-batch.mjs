import { createRequire } from 'node:module'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const ts = require('typescript')

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

const { DRAMA_POOL_ENTRIES, CANONICAL_TITLES } = loadDramaData()

async function checkBatch(lang, titles) {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|pageprops&piprop=thumbnail&titles=${encodeURIComponent(titles.join('|'))}&redirects=1`
  const res = await fetch(url)
  const data = await res.json()
  return data.query?.pages || {}
}

async function main() {
  const targets = DRAMA_POOL_ENTRIES.filter(e => 
    e.category === 'Divers' || 
    e.category === 'YouTubeurs FR' || 
    e.category === 'YouTubeurs US'
  )
  
  const byLang = { 'en': [], 'fr': [] }
  for (const entry of targets) {
    const canonical = CANONICAL_TITLES[`${entry.lang}:${entry.title}`] || entry.title
    byLang[entry.lang].push({ orig: entry.title, canonical, cat: entry.category })
  }
  
  for (const lang of ['en', 'fr']) {
    const list = byLang[lang]
    for (let i = 0; i < list.length; i += 50) {
      const batch = list.slice(i, i + 50)
      const titles = batch.map(b => b.canonical)
      const pages = await checkBatch(lang, titles)
      for (const p of Object.values(pages)) {
        if (p.missing) {
          console.log(`[MISSING PAGE] ${lang} | ${p.title}`)
        } else if (!p.thumbnail && !p.pageprops?.wikibase_item) {
          console.log(`[NO THUMB/WIKIDATA] ${lang} | ${p.title}`)
        }
      }
    }
  }
}

main().catch(console.error)

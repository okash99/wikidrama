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

async function fetchSummary(title, lang) {
  const canonical = CANONICAL_TITLES[`${lang}:${title}`] || title
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(canonical)}`
  const res = await fetch(url)
  if (!res.ok) {
    return { title, status: res.status, canonical }
  }
  const data = await res.json()
  return { title, status: 'ok', thumbnail: data.thumbnail?.source, canonical }
}

async function main() {
  const targets = DRAMA_POOL_ENTRIES.filter(e => 
    e.category === 'Divers' || 
    e.category === 'YouTubeurs FR' || 
    e.category === 'YouTubeurs US'
  )
  
  for (const entry of targets) {
    const res = await fetchSummary(entry.title, entry.lang)
    if (res.status !== 'ok' || !res.thumbnail) {
      console.log(`[MISSING] ${entry.category} | ${entry.lang} | ${entry.title} -> ${res.canonical} (Status: ${res.status}, Thumb: ${!!res.thumbnail})`)
    }
  }
}

main().catch(console.error)

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

async function checkTitle(lang, title) {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&origin=*`
  const res = await fetch(url, { headers: { 'User-Agent': 'WikiDramaTest/1.0' } })
  const text = await res.text()
  if (text.includes('"missing"')) {
    return false
  }
  return true
}

async function main() {
  const targets = DRAMA_POOL_ENTRIES.filter(e => 
    e.category === 'Divers' || 
    e.category === 'YouTubeurs FR' || 
    e.category === 'YouTubeurs US'
  )
  
  for (const entry of targets) {
    const canonical = CANONICAL_TITLES[`${entry.lang}:${entry.title}`] || entry.title
    const exists = await checkTitle(entry.lang, canonical)
    if (!exists) {
      console.log(`[MISSING PAGE] ${entry.lang} | ${entry.title} (Canonical: ${canonical})`)
    }
    await new Promise(r => setTimeout(r, 100))
  }
}

main().catch(console.error)

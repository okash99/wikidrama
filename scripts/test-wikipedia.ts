import { fetchArticleData } from '../src/api/wikipedia'

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
} as any

async function runTest() {
  console.log('--- TEST: fetchArticleData() ---')
  console.log('Attempting to draw and fetch a random article from the pool...')
  
  try {
    const start = Date.now()
    const { article, stats } = await fetchArticleData()
    const duration = Date.now() - start
    
    console.log('\n✅ SUCCESS!')
    console.log(`⏱️  Time taken: ${duration}ms`)
    console.log(`📌 Title: ${article.title}`)
    console.log(`📖 Extract: ${article.extract.substring(0, 80)}...`)
    console.log(`📊 Stats:`)
    console.log(`   - Edits: ${stats.editCount}`)
    console.log(`   - Unique Editors: ${stats.uniqueEditors}`)
    console.log(`   - Reversion Rate: ${stats.reversionRate}%`)
    
  } catch (error) {
    console.error('\n❌ FAILED!')
    console.error(error)
  }
}

runTest()

import { DRAMA_POOL } from '../src/data/drama-articles'

const allArticles = new Map<string, string[]>()

Object.entries(DRAMA_POOL).forEach(([category, articles]) => {
  articles.forEach((article) => {
    // case insensitive comparison for safety
    const key = article.toLowerCase().trim()
    if (!allArticles.has(key)) {
      allArticles.set(key, [])
    }
    allArticles.get(key)!.push(category)
  })
})

const duplicates: { article: string; categories: string[] }[] = []
allArticles.forEach((categories, article) => {
  if (categories.length > 1) {
    duplicates.push({ article, categories })
  }
})

console.log('--- AUDIT: DUPLICATES ---')
if (duplicates.length === 0) {
  console.log('No duplicates found.')
} else {
  duplicates.forEach((d) => console.log(`- "${d.article}" is in: ${d.categories.join(', ')}`))
}

// Wikipedia REST API — base URL
const BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const ACTION_URL = 'https://en.wikipedia.org/w/api.php'

export interface WikiArticle {
  title: string
  extract: string
  thumbnail?: string
  pageId: number
  url: string
}

// Fetch a random article summary
export async function fetchRandomArticle(): Promise<WikiArticle> {
  const res = await fetch(`${BASE_URL}/page/random/summary`)
  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract,
    thumbnail: data.thumbnail?.source,
    pageId: data.pageid,
    url: data.content_urls?.desktop?.page || '',
  }
}

// Fetch article edit stats for Drama Score calculation
export async function fetchArticleStats(title: string): Promise<{
  editCount: number
  uniqueEditors: number
  recentEdits: number
}> {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvprop: 'ids|timestamp|user',
    rvlimit: '500',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${ACTION_URL}?${params}`)
  const data = await res.json()
  const pages = data.query?.pages || {}
  const page = Object.values(pages)[0] as any
  const revisions = page?.revisions || []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentEdits = revisions.filter(
    (r: any) => new Date(r.timestamp) > thirtyDaysAgo
  ).length

  const uniqueEditors = new Set(revisions.map((r: any) => r.user)).size

  return {
    editCount: revisions.length,
    uniqueEditors,
    recentEdits,
  }
}

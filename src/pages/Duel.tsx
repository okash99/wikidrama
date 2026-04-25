import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchArticleData, fetchArticleFromCategory, type ArticleData } from '../api/wikipedia'
import { computeDramaScore } from '../utils/dramaScore'
import DuelCard from '../components/DuelCard'
import CategoryPicker from '../components/CategoryPicker'
import LoadingDuel from '../components/LoadingDuel'

type Phase = 'pick-category' | 'loading' | 'vote' | 'reveal'

export default function Duel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode') || 'random'

  const [phase, setPhase] = useState<Phase>(mode === 'random' ? 'loading' : 'pick-category')
  const [category, setCategory] = useState('Politique')
  const [articles, setArticles] = useState<[ArticleData, ArticleData] | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadDuel = useCallback(async (cat?: string) => {
    setPhase('loading')
    setSelected(null)
    setArticles(null)
    setError(null)
    try {
      const fetcher = cat
        ? () => fetchArticleFromCategory(cat)
        : fetchArticleData
      const [a, b] = await Promise.all([fetcher(), fetcher()])
      setArticles([a, b])
      setPhase('vote')
    } catch (e) {
      setError('Impossible de charger les articles. Vérifie ta connexion.')
      setPhase('vote')
    }
  }, [])

  useEffect(() => {
    if (mode === 'random') loadDuel()
  }, [mode, loadDuel])

  function handleVote(index: 0 | 1) {
    if (phase !== 'vote') return
    setSelected(index)
    setPhase('reveal')
  }

  function getWinner(): 0 | 1 {
    if (!articles) return 0
    const s0 = computeDramaScore(articles[0].stats)
    const s1 = computeDramaScore(articles[1].stats)
    return s0 >= s1 ? 0 : 1
  }

  return (
    <main className="flex flex-col flex-1 px-4 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-slate-500 text-sm">← Accueil</button>
        <h1 className="font-bold text-base">
          {mode === 'random' ? '⚡ Duel Random' : '🗂️ Duel Thématique'}
        </h1>
        <div className="w-16" />
      </div>

      {/* Category Picker */}
      {mode === 'thematic' && phase === 'pick-category' && (
        <>
          <CategoryPicker selected={category} onChange={setCategory} />
          <button
            onClick={() => loadDuel(category)}
            className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-lg"
          >
            ⚔️ Lancer le duel
          </button>
        </>
      )}

      {/* Loading */}
      {phase === 'loading' && <LoadingDuel />}

      {/* Error */}
      {error && (
        <div className="text-center text-red-400 text-sm py-4">{error}</div>
      )}

      {/* Duel Cards */}
      {articles && (phase === 'vote' || phase === 'reveal') && (
        <>
          <p className="text-center text-slate-400 text-sm">
            {phase === 'vote'
              ? '👆 Lequel est le plus controversé ?'
              : selected === getWinner()
              ? '✅ Bien joué ! Tu avais le bon flair.'
              : '❌ Raté ! L\'autre était plus drama.'}
          </p>

          <div className="flex flex-col gap-4">
            {articles.map((data, i) => (
              <DuelCard
                key={data.article.pageId}
                data={data}
                revealed={phase === 'reveal'}
                selected={selected === i}
                winner={phase === 'reveal' && getWinner() === i}
                onClick={() => handleVote(i as 0 | 1)}
              />
            ))}
          </div>

          {/* Rejouer */}
          {phase === 'reveal' && (
            <button
              onClick={() =>
                mode === 'thematic'
                  ? loadDuel(category)
                  : loadDuel()
              }
              className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-lg mt-2"
            >
              🔄 Rejouer
            </button>
          )}
        </>
      )}
    </main>
  )
}

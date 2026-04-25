import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchArticleData, fetchArticleFromCategory, type ArticleData } from '../api/wikipedia'
import { computeDramaScore } from '../utils/dramaScore'
import DuelCard from '../components/DuelCard'
import CategoryPicker from '../components/CategoryPicker'
import ShareButton from '../components/ShareButton'

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
      const fetcher = cat ? () => fetchArticleFromCategory(cat) : fetchArticleData
      const [a, b] = await Promise.all([fetcher(), fetcher()])
      setArticles([a, b])
      setPhase('vote')
    } catch {
      setError('Impossible de charger les articles.')
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
    return computeDramaScore(articles[0].stats) >= computeDramaScore(articles[1].stats) ? 0 : 1
  }

  const winner = getWinner()

  // --- Category picker ---
  if (phase === 'pick-category') {
    return (
      <main className="flex flex-col flex-1 px-4 py-6 gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-slate-500 text-sm">← Accueil</button>
          <h1 className="font-bold text-base">🗂️ Duel Thématique</h1>
          <div className="w-16" />
        </div>
        <CategoryPicker selected={category} onChange={setCategory} />
        <button
          onClick={() => loadDuel(category)}
          className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-lg mt-auto"
        >
          ⚔️ Lancer le duel
        </button>
      </main>
    )
  }

  // --- Loading ---
  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">⚔️</div>
        <p className="text-slate-400 text-sm">Chargement du duel...</p>
      </main>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4 px-6">
        <p className="text-red-400 text-sm text-center">{error}</p>
        <button onClick={() => loadDuel()} className="text-slate-400 underline text-sm">Réessayer</button>
      </main>
    )
  }

  // --- Duel ---
  return (
    <main className="flex flex-col flex-1">

      {/* Split screen — hauteur fixe, ne dépasse pas */}
      <div className={`relative flex flex-col ${ phase === 'reveal' ? 'h-[55vh]' : 'flex-1' } transition-all duration-300`}>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-30 text-white/60 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
        >
          ←
        </button>

        {/* Result banner */}
        {phase === 'reveal' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 fade-in">
            <span className={`text-sm font-bold px-4 py-2 rounded-full backdrop-blur-sm
              ${ selected === winner ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white' }`}
            >
              {selected === winner ? '✅ Bien joué !' : '❌ Raté !'}
            </span>
          </div>
        )}

        {/* Cards */}
        {articles && (
          <div className="flex flex-col flex-1">
            <DuelCard
              data={articles[0]}
              revealed={phase === 'reveal'}
              selected={selected === 0}
              winner={phase === 'reveal' && winner === 0}
              onClick={() => handleVote(0)}
              position="top"
            />

            {/* VS divider */}
            <div className="relative z-20 flex items-center justify-center h-0">
              <span className="bg-slate-950 border-2 border-slate-600 text-white font-extrabold text-xs w-9 h-9 rounded-full flex items-center justify-center shadow-lg">
                VS
              </span>
            </div>

            <DuelCard
              data={articles[1]}
              revealed={phase === 'reveal'}
              selected={selected === 1}
              winner={phase === 'reveal' && winner === 1}
              onClick={() => handleVote(1)}
              position="bottom"
            />
          </div>
        )}
      </div>

      {/* Actions post-reveal — en dessous du split, dans le flux */}
      {phase === 'reveal' && articles && (
        <div className="flex flex-col gap-3 px-4 py-4 fade-in bg-slate-950">
          <ShareButton articles={articles} winner={winner} selected={selected} />
          <button
            onClick={() => mode === 'thematic' ? loadDuel(category) : loadDuel()}
            className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-lg"
          >
            🔄 Rejouer
          </button>
        </div>
      )}

    </main>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchArticleData, fetchArticleFromCategory, type ArticleData } from '../api/wikipedia'
import { computeDramaScore } from '../utils/dramaScore'
import DuelCard from '../components/DuelCard'
import CategoryPicker from '../components/CategoryPicker'
import ShareButton from '../components/ShareButton'

type Phase = 'pick-category' | 'loading' | 'vote' | 'reveal'
export type WinnerState = 0 | 1 | 'tie'

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export default function Duel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode') || 'random'

  const [phase, setPhase] = useState<Phase>(mode === 'random' ? 'loading' : 'pick-category')
  const [category, setCategory] = useState('Politique')
  const [articles, setArticles] = useState<[ArticleData, ArticleData] | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDistinctPair = useCallback(async (cat?: string): Promise<[ArticleData, ArticleData]> => {
    const fetcher = cat ? () => fetchArticleFromCategory(cat) : fetchArticleData
    const [a, b] = await Promise.all([fetcher(), fetcher()])
    if (a.article.pageId === b.article.pageId) {
      for (let i = 0; i < 2; i++) {
        const replacement = await fetcher()
        if (replacement.article.pageId !== a.article.pageId) return [a, replacement]
      }
    }
    return [a, b]
  }, [])

  const loadDuel = useCallback(async (cat?: string) => {
    if (isOffline()) {
      setError('offline')
      setPhase('vote')
      return
    }
    setPhase('loading')
    setSelected(null)
    setArticles(null)
    setError(null)
    try {
      const pair = await fetchDistinctPair(cat)
      setArticles(pair)
      setPhase('vote')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('AbortError') || isOffline()) {
        setError('offline')
      } else {
        setError('generic')
      }
      setPhase('vote')
    }
  }, [fetchDistinctPair])

  useEffect(() => {
    if (mode === 'random') loadDuel()
  }, [mode, loadDuel])

  function handleVote(index: 0 | 1) {
    if (phase !== 'vote') return
    setSelected(index)
    setPhase('reveal')
  }

  function getWinner(): WinnerState {
    if (!articles) return 0
    const scoreA = computeDramaScore(articles[0].stats)
    const scoreB = computeDramaScore(articles[1].stats)
    if (scoreA === scoreB) return 'tie'
    return scoreA > scoreB ? 0 : 1
  }

  const winner = getWinner()
  const isTie = winner === 'tie'
  const guessedRight = isTie || selected === winner

  function getResultMessage(): string {
    if (isTie) return "\u{1F91D} \u00c9galit\u00e9 ! Les deux articles sont aussi drama l'un que l'autre."
    if (guessedRight) return '\u2705 Bien jou\u00e9 ! Tu avais le bon flair.'
    return "\u274c Rat\u00e9 ! L'autre \u00e9tait plus drama."
  }

  function getResultColor(): string {
    if (isTie) return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  if (phase === 'pick-category') {
    return (
      <main className="flex flex-col flex-1 px-4 py-6 gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-slate-500 text-sm">&#x2190; Accueil</button>
          <h1 className="font-bold text-base">&#x1F5C2;&#xFE0F; Duel Th\u00e9matique</h1>
          <div className="w-16" />
        </div>
        <CategoryPicker selected={category} onChange={setCategory} />
        <button
          onClick={() => loadDuel(category)}
          className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-lg mt-auto"
        >
          &#x2694;&#xFE0F; Lancer le duel
        </button>
      </main>
    )
  }

  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">&#x2694;&#xFE0F;</div>
        <p className="text-slate-400 text-sm">Chargement du duel...</p>
      </main>
    )
  }

  if (error) {
    const isOfflineError = error === 'offline'
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">{isOfflineError ? '\ud83d\udce1' : '\ud83d\ude45'}</span>
        <div className="flex flex-col gap-1">
          <p className="text-white font-bold">
            {isOfflineError ? 'Pas de connexion' : 'Chargement impossible'}
          </p>
          <p className="text-slate-400 text-sm">
            {isOfflineError
              ? 'V\u00e9rifie ta connexion puis r\u00e9essaie.'
              : 'Wikipedia ou XTools ne r\u00e9pond pas. R\u00e9essaie dans quelques secondes.'}
          </p>
        </div>
        <button
          onClick={() => loadDuel(mode === 'thematic' ? category : undefined)}
          className="py-2.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm"
        >
          &#x1F504; R\u00e9essayer
        </button>
        <button onClick={() => navigate('/')} className="text-slate-500 text-xs underline">
          Retour \u00e0 l'accueil
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-slate-950">
      {articles && (
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-3 left-3 z-30 text-white/60 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            &#x2190;
          </button>

          <div className="flex-1 overflow-hidden">
            <DuelCard
              data={articles[0]}
              revealed={phase === 'reveal'}
              selected={selected === 0}
              winner={phase === 'reveal' && (winner === 0 || isTie)}
              onClick={() => handleVote(0)}
              position="top"
            />
          </div>

          <div className="relative z-20 flex items-center justify-center h-0 flex-shrink-0">
            <span className="bg-slate-950 border-2 border-slate-600 text-white font-extrabold text-xs w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              VS
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <DuelCard
              data={articles[1]}
              revealed={phase === 'reveal'}
              selected={selected === 1}
              winner={phase === 'reveal' && (winner === 1 || isTie)}
              onClick={() => handleVote(1)}
              position="bottom"
            />
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-slate-950 border-t border-slate-800 px-3 py-2.5">
        {phase === 'vote' && (
          <p className="text-center text-slate-500 text-xs py-1">
            &#x1F446; Tape sur l'article le plus controvers\u00e9
          </p>
        )}
        {phase === 'reveal' && articles && (
          <div className="flex flex-col gap-2 fade-in">
            <p className={`text-center text-sm font-bold ${getResultColor()}`}>
              {getResultMessage()}
            </p>
            <div className="flex gap-2">
              <ShareButton articles={articles} winner={winner} selected={selected} />
              <button
                onClick={() => mode === 'thematic' ? loadDuel(category) : loadDuel()}
                className="flex-shrink-0 py-2.5 px-5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
              >
                &#x1F504; Rejouer
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

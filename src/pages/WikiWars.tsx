import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSummaryForWikiWars } from '../api/pageviews'
import { getPopularityLabel, getPopularityColor, getPopularityBarColor, formatViews, viewsToScore, getPopularityTier } from '../utils/popularityScore'
import { E } from '../utils/emojis'

type Phase = 'loading' | 'vote' | 'reveal'

interface CardData {
  title: string
  extract: string
  thumbnail?: string
  views: number
  month: string
}

export default function WikiWars() {
  const navigate = useNavigate()
  const [phase, setPhase]       = useState<Phase>('loading')
  const [cards, setCards]       = useState<[CardData, CardData] | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [error, setError]       = useState(false)

  const loadDuel = useCallback(async () => {
    setPhase('loading')
    setSelected(null)
    setCards(null)
    setError(false)
    try {
      const [a, b] = await Promise.all([
        fetchSummaryForWikiWars(),
        fetchSummaryForWikiWars(),
      ])
      // Assure deux articles distincts
      if (a.title === b.title) {
        const c = await fetchSummaryForWikiWars()
        setCards([a, c])
      } else {
        setCards([a, b])
      }
      setPhase('vote')
    } catch {
      setError(true)
      setPhase('vote')
    }
  }, [])

  useEffect(() => { loadDuel() }, [loadDuel])

  function handleVote(index: 0 | 1) {
    if (phase !== 'vote' || !cards) return
    setSelected(index)
    setPhase('reveal')
  }

  function getWinner(): 0 | 1 | 'tie' {
    if (!cards) return 0
    if (cards[0].views === cards[1].views) return 'tie'
    return cards[0].views > cards[1].views ? 0 : 1
  }

  const winner      = getWinner()
  const isTie       = winner === 'tie'
  const guessedRight = isTie || selected === winner

  function getResultMessage(): string {
    if (isTie)        return `${E.handshake} ${E.duelTie}`
    if (guessedRight) return `${E.checkmark} ${E.duelRight}`
    return `${E.cross} ${E.duelWrong}`
  }

  function getResultColor(): string {
    if (isTie)        return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  // Loading
  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">{E.pvIcon}</div>
        <p className="text-slate-400 text-sm">{E.wwLoading}</p>
      </main>
    )
  }

  // Erreur
  if (error) {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">{E.satellite}</span>
        <p className="text-white font-bold">{E.duelErrorTitle}</p>
        <p className="text-slate-400 text-sm">{E.duelErrorMsg}</p>
        <button onClick={loadDuel}
          className="py-2.5 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm">
          {E.reload} {E.duelRetry}
        </button>
        <button onClick={() => navigate('/')} className="text-slate-500 text-xs underline">
          {E.duelBackHome}
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-slate-950">
      {cards && (
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-3 left-3 z-30 text-white/60 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            {E.arrowLeft}
          </button>

          {[0, 1].map((i) => {
            const card = cards[i as 0 | 1]
            const isWinner = phase === 'reveal' && (winner === i || isTie)
            const isLoser  = phase === 'reveal' && !isWinner
            const score    = viewsToScore(card.views)
            const colorText = getPopularityColor(card.views)
            const colorBar  = getPopularityBarColor(card.views)
            const tier      = getPopularityTier(card.views)
            const isViral   = tier === 'viral'
            const isMondial = tier === 'mondial'

            return (
              <div key={i} className="flex-1 overflow-hidden">
                <button
                  onClick={() => handleVote(i as 0 | 1)}
                  disabled={phase === 'reveal'}
                  className={`relative w-full h-full overflow-hidden transition-all
                    ${ isLoser ? 'opacity-50' : 'opacity-100' }
                    ${ phase !== 'reveal' ? 'active:brightness-110' : '' }
                  `}
                >
                  {card.thumbnail ? (
                    <img src={card.thumbnail} alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                  )}

                  <div className={`absolute inset-0 ${
                    isViral   && isWinner ? 'bg-purple-950/50' :
                    isMondial && isWinner ? 'bg-yellow-950/40' :
                    isWinner  && phase === 'reveal' ? 'bg-black/40' : 'bg-black/60'
                  }`} />

                  {isViral   && isWinner && <div className="absolute inset-0 pointer-events-none legendary-shimmer" />}
                  {isMondial && isWinner && <div className="absolute inset-0 pointer-events-none enormous-shimmer" />}
                  {isWinner  && phase === 'reveal' && !isViral && !isMondial && (
                    <div className="absolute inset-0 border-4 border-purple-400 pointer-events-none" />
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">
                    {isWinner && phase === 'reveal' && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isViral   ? 'bg-purple-500/80 text-white legendary-badge-glow' :
                        isMondial ? 'bg-yellow-400 text-slate-900 enormous-badge-glow' :
                        'bg-purple-500 text-white'
                      }`}>
                        {E.pvIcon} {E.wwMostViewed}
                      </div>
                    )}

                    <h2 className="text-white font-extrabold text-xl text-center leading-tight drop-shadow-lg">
                      {card.title}
                    </h2>

                    {card.extract && (
                      <p className="text-white/90 text-xs text-center leading-relaxed bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-sm line-clamp-3 w-full">
                        {card.extract}
                      </p>
                    )}

                    {phase !== 'reveal' && (
                      <span className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1">
                        {E.vote} {E.wwVote}
                      </span>
                    )}

                    {phase === 'reveal' && (
                      <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
                        <span className={`font-extrabold text-3xl drop-shadow-lg ${colorText} ${
                          isViral ? 'legendary-text-glow' : isMondial ? 'enormous-text-glow' : ''
                        }`}>
                          {formatViews(card.views)}
                        </span>
                        <p className="text-white/60 text-xs">{E.wwViewsMonth} {card.month}</p>
                        <p className={`text-xs font-semibold ${colorText}`}>{getPopularityLabel(card.views)}</p>
                        <div className="w-full h-1.5 rounded-full bg-white/20">
                          <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <span className="bg-slate-950 border-2 border-purple-600 text-white font-extrabold text-xs w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              VS
            </span>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-slate-950 border-t border-slate-800 px-3 py-2.5">
        {phase === 'vote' && (
          <p className="text-center text-slate-500 text-xs py-1">
            {E.finger} {E.wwInstruction}
          </p>
        )}
        {phase === 'reveal' && (
          <div className="flex flex-col gap-2 fade-in">
            <p className={`text-center text-sm font-bold ${getResultColor()}`}>
              {getResultMessage()}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={loadDuel}
                className="py-2.5 px-8 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm"
              >
                {E.reload} Rejouer
              </button>
              <button
                onClick={() => navigate('/')}
                className="py-2.5 px-5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-bold text-sm"
              >
                {E.arrowLeft} Accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { fetchSummaryForWikiWars, type PageviewsData } from '../api/pageviews'
import { getPopularityTierKey, getPopularityTierEmoji, getPopularityColor, getPopularityBarColor, formatViews, viewsToScore, getPopularityTier } from '../utils/popularityScore'
import { E } from '../utils/emojis'

type Phase = 'loading' | 'vote' | 'reveal'

function dramaBar(score: number): string {
  const filled = Math.round(score / 10)
  return '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled)
}

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

function ShareModal({
  cards, winner, selected, onClose
}: {
  cards: [PageviewsData, PageviewsData]
  winner: 0 | 1 | 'tie'
  selected: 0 | 1 | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()
  const isTie = winner === 'tie'
  const winnerIdx: 0 | 1  = isTie ? 0 : winner
  const loserIdx:  0 | 1  = winnerIdx === 0 ? 1 : 0
  const winnerCard = cards[winnerIdx]
  const loserCard  = cards[loserIdx]
  const guessedRight = isTie || selected === winner

  const scoreW = viewsToScore(winnerCard.views)
  const scoreL = viewsToScore(loserCard.views)

  const shareText = [
    `${E.pvIcon} WikiWars ${isTie ? E.scales : E.swords}`,
    '',
    isTie
      ? `${E.scales} ${winnerCard.title} = ${loserCard.title}`
      : `${E.winner} ${winnerCard.title}`,
    `   ${dramaBar(scoreW)} ${formatViews(winnerCard.views)} ${t('shareViews12m')}`,
    ...(!isTie ? [
      '',
      `${E.disputed} ${loserCard.title}`,
      `   ${dramaBar(scoreL)} ${formatViews(loserCard.views)} ${t('shareViews12m')}`,
    ] : []),
    '',
    guessedRight ? `${E.checkmark} ${t('iKnewIt')}` : `${E.cross} ${t('gotMe')}`,
    '',
    `${E.pointRight} wikidrama.pages.dev`,
  ].join('\n')

  const tweetText = [
    `${E.pvIcon} WikiWars`,
    isTie
      ? `${E.scales} ${t('shareTieHeader')} ${winnerCard.title} vs ${loserCard.title}`
      : `${E.winner} ${winnerCard.title} (${formatViews(winnerCard.views)}) > ${loserCard.title} (${formatViews(loserCard.views)})`,
    guessedRight ? `${E.checkmark} ${t('iKnewIt')}` : `${E.cross} ${t('gotMe')}`,
    'https://wikidrama.pages.dev',
  ].join('\n')

  async function copyText() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => { setCopied(false); onClose() }, 2000)
    } catch { alert(shareText) }
  }

  async function shareNative() {
    try { await navigator.share({ title: 'WikiWars', text: shareText }); onClose() }
    catch { /* cancelled */ }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-panel border border-border-strong rounded-t-3xl p-5 flex flex-col gap-4 slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border-strong rounded-full mx-auto" />
        <p className="text-sm font-semibold text-text text-center">{E.pvIcon} {t('sharePartager')}</p>

        <div className="bg-card border border-border-strong rounded-2xl p-4 max-h-44 overflow-y-auto scrollbar-none">
          <pre className="text-xs text-text whitespace-pre-wrap font-mono leading-relaxed">{shareText}</pre>
        </div>

        <div className="flex flex-col gap-2">
          {canShare && (
            <button onClick={shareNative}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.phone} {t('shareVia')}
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank'); onClose() }}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.whatsapp} WhatsApp
            </button>
            <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank'); onClose() }}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.twitter} Twitter
            </button>
          </div>
          <button onClick={copyText}
            className="w-full py-3 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            {copied ? `${E.checkmark} ${t('shareCopied')}` : `${E.clipboard} ${t('copyText')}`}
          </button>
        </div>
        <button onClick={onClose} className="text-muted text-sm text-center py-1">{t('shareAnnuler')}</button>
      </div>
    </div>,
    document.body
  )
}

export default function WikiWars() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [phase, setPhase]         = useState<Phase>('loading')
  const [cards, setCards]         = useState<[PageviewsData, PageviewsData] | null>(null)
  const [selected, setSelected]   = useState<0 | 1 | null>(null)
  const [error, setError]         = useState(false)
  const [showShare, setShowShare] = useState(false)

  const loadDuel = useCallback(async () => {
    setPhase('loading')
    setSelected(null)
    setCards(null)
    setError(false)
    setShowShare(false)
    try {
      const [a, b] = await Promise.all([fetchSummaryForWikiWars(), fetchSummaryForWikiWars()])
      setCards(a.title === b.title ? [a, await fetchSummaryForWikiWars()] : [a, b])
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

  const winner       = getWinner()
  const isTie        = winner === 'tie'
  const guessedRight = isTie || selected === winner

  function getResultMessage() {
    if (isTie)        return `${E.handshake} ${t('duelTie')}`
    if (guessedRight) return `${E.checkmark} ${t('duelRight')}`
    return `${E.cross} ${t('duelWrong')}`
  }
  function getResultColor() {
    if (isTie)        return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">{E.pvIcon}</div>
        <p className="text-muted text-sm">{t('wwLoading')}</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">{E.satellite}</span>
        <p className="text-white font-bold">{t('duelErrorTitle')}</p>
        <p className="text-muted text-sm">{t('duelErrorMsg')}</p>
        <button onClick={loadDuel} className="py-2.5 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm">
          {E.reload} {t('duelRetry')}
        </button>
        <button onClick={() => navigate('/')} className="text-muted text-xs underline">{t('duelBackHome')}</button>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-base">
      {cards && (
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-3 left-3 z-30 text-white/60 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            {E.arrowLeft}
          </button>

          {[0, 1].map((i) => {
            const card      = cards[i as 0 | 1]
            const isWinner  = phase === 'reveal' && (winner === i || isTie)
            const isLoser   = phase === 'reveal' && !isWinner
            const score     = viewsToScore(card.views)
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
                    ${isLoser ? 'opacity-50' : 'opacity-100'}
                    ${phase !== 'reveal' ? 'active:brightness-110' : ''}
                  `}
                >
                  {card.thumbnail
                    ? <img src={card.thumbnail} alt={card.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    : <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />}

                  <div className={`absolute inset-0 ${
                    isViral   && isWinner ? 'bg-purple-950/50' :
                    isMondial && isWinner ? 'bg-yellow-950/40' :
                    isWinner  ? 'bg-black/40' : 'bg-black/60'
                  }`} />

                  {isViral   && isWinner && <div className="absolute inset-0 pointer-events-none legendary-shimmer" />}
                  {isMondial && isWinner && <div className="absolute inset-0 pointer-events-none enormous-shimmer" />}
                  {isWinner  && !isViral && !isMondial && (
                    <div className="absolute inset-0 border-4 border-purple-400 pointer-events-none" />
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">
                    {isWinner && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isViral   ? 'bg-purple-500/80 text-white legendary-badge-glow' :
                        isMondial ? 'bg-yellow-400 text-slate-900 enormous-badge-glow' :
                        'bg-purple-500 text-white'
                      }`}>
                        {E.pvIcon} {t('wwMostViewed')}
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
                      <span className="text-white/80 font-medium text-xs border-2 border-white/30 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                        {E.vote} {t('wwVote')}
                      </span>
                    )}

                    {phase === 'reveal' && (
                      <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
                        <span className={`font-extrabold text-3xl drop-shadow-lg ${colorText} ${
                          isViral ? 'legendary-text-glow' : isMondial ? 'enormous-text-glow' : ''
                        }`}>
                          {formatViews(card.views)}
                        </span>
                        <p className="text-white/50 text-xs">{t('wwViews12m')}</p>
                        <p className={`text-xs font-semibold ${colorText}`}>{getPopularityTierEmoji(card.views)} {t(getPopularityTierKey(card.views))}</p>
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
            <span className="bg-base border border-purple-600 text-text font-extrabold text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
              VS
            </span>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-base border-t border-border px-3 py-2.5">
        {phase === 'vote' && (
          <p className="text-center text-muted text-xs py-1">
            {E.finger} {t('wwInstruction')}
          </p>
        )}
        {phase === 'reveal' && cards && (
          <div className="flex flex-col gap-2 fade-in">
            <p className={`text-center text-sm font-bold ${getResultColor()}`}>
              {getResultMessage()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="flex-1 py-2.5 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-bold text-sm flex items-center justify-center gap-1.5"
              >
                {t('share')}
              </button>
              <button
                onClick={loadDuel}
                className="flex-shrink-0 py-2.5 px-5 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
              >
                {E.reload} {t('replay')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showShare && cards && (
        <ShareModal
          cards={cards}
          winner={winner}
          selected={selected}
          onClose={() => setShowShare(false)}
        />
      )}
    </main>
  )
}

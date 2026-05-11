import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { fetchSummaryForWikiWars, type PageviewsData } from '../api/pageviews'
import { getPopularityTierKey, getPopularityColor, getPopularityBarColor, formatViews, viewsToScore, getPopularityTier } from '../utils/popularityScore'
import { E } from '../utils/emojis'
import { useSettings } from '../context/SettingsContext'
import { useProfile } from '../context/ProfileContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import Icon from '../components/Icon'
import SuddenDeathOverlay from '../components/SuddenDeathOverlay'
import VoteArrow from '../components/VoteArrow'

type Phase = 'loading' | 'vote' | 'reveal' | 'sudden-death'

const SUDDEN_DEATH_SECONDS = 5

// ─── Count-up animation ───────────────────────────────────────────────────────

const COUNT_UP_DURATION_MS = 1500
const COUNT_UP_INTERVAL_MS = 16

function useCountUp(target: number, active: boolean): number {
  const [displayed, setDisplayed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed(0)
      return
    }

    setDisplayed(0)
    const steps = COUNT_UP_DURATION_MS / COUNT_UP_INTERVAL_MS
    const increment = target / steps
    let current = 0

    intervalRef.current = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplayed(target)
        clearInterval(intervalRef.current!)
      } else {
        setDisplayed(Math.floor(current))
      }
    }, COUNT_UP_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [target, active])

  return displayed
}

// ─── WikiWarsCard ─────────────────────────────────────────────────────────────

function WikiWarsCard({
  card, isWinner, isLoser, isSuddenDeathExpired, phase, onVote, index, t,
}: {
  card: PageviewsData
  isWinner: boolean
  isLoser: boolean
  isSuddenDeathExpired: boolean
  phase: Phase
  onVote: (i: 0 | 1) => void
  index: 0 | 1
  t: (key: string) => string
}) {
  const score     = viewsToScore(card.views)
  const colorText = getPopularityColor(card.views)
  const colorBar  = getPopularityBarColor(card.views)
  const tier      = getPopularityTier(card.views)
  const isViral   = tier === 'viral'
  const isMondial = tier === 'mondial'

  const displayedViews = useCountUp(card.views, phase === 'reveal')

  return (
    <div className="flex-1 overflow-hidden">
      <button
        onClick={() => onVote(index)}
        disabled={phase === 'reveal' || isSuddenDeathExpired}
        className={`relative w-full h-full overflow-hidden transition-all
          ${isLoser || isSuddenDeathExpired ? 'opacity-40' : 'opacity-100'}
          ${phase !== 'reveal' && !isSuddenDeathExpired ? 'active:brightness-110' : ''}
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

        {isViral   && isWinner && <div className="absolute inset-0 pointer-events-none viral-shimmer" />}
        {isMondial && isWinner && <div className="absolute inset-0 pointer-events-none enormous-shimmer" />}
        {isWinner  && !isViral && !isMondial && (
          <div className="absolute inset-0 border-4 border-purple-400 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">
          {isWinner && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isViral   ? 'bg-purple-500/80 text-white viral-badge-glow' :
              isMondial ? 'bg-yellow-400 text-slate-900 enormous-badge-glow' :
              'bg-purple-500 text-white'
            }`}>
              <Icon name="eyesOnOutlined" className="h-3.5 w-3.5" />
              {t('wwMostViewed')}
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
              <VoteArrow className="mr-1" />
              {t('wwVote')}
            </span>
          )}

          {phase === 'reveal' && (
            <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
              <span className={`font-extrabold text-3xl drop-shadow-lg ${colorText} ${
                isViral ? 'viral-text-glow' : isMondial ? 'enormous-text-glow' : ''
              }`}>
                {formatViews(displayedViews)}
              </span>
              <p className="text-white/50 text-xs">{t('wwViews12m')}</p>
              <p className={`text-xs font-semibold ${colorText}`}>{t(getPopularityTierKey(card.views))}</p>
              <div className="w-full h-1.5 rounded-full bg-white/20">
                <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          )}
        </div>
      </button>
    </div>
  )
}

// ─── Share modal ──────────────────────────────────────────────────────────────

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
  const modalRef = useFocusTrap(true, onClose)
  const isTie = winner === 'tie'
  const winnerIdx: 0 | 1  = isTie ? 0 : winner
  const loserIdx:  0 | 1  = winnerIdx === 0 ? 1 : 0
  const winnerCard = cards[winnerIdx]
  const loserCard  = cards[loserIdx]
  const guessedRight = isTie || selected === winner

  const scoreW = viewsToScore(winnerCard.views)
  const scoreL = viewsToScore(loserCard.views)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const shareText = [
    isTie ? t('wwShareTieHeader') : t('wwShareHeader'),
    '',
    isTie
      ? `${winnerCard.title} = ${loserCard.title}`
      : `Winner: ${winnerCard.title}`,
    isTie
      ? `   ${t('wwShareTieBoth').replace('%views%', formatViews(winnerCard.views))}`
      : `   ${dramaBar(scoreW)} ${formatViews(winnerCard.views)} ${t('shareViews12m')}`,
    ...(!isTie ? [
      '',
      `Challenger: ${loserCard.title}`,
      `   ${dramaBar(scoreL)} ${formatViews(loserCard.views)} ${t('shareViews12m')}`,
    ] : []),
    '',
    guessedRight ? t('wwShareRight') : t('wwShareWrong'),
    '',
    t('wwShareTryIt'),
    'https://wikidrama.pages.dev',
  ].join('\n')

  const tweetText = [
    'WikiWars',
    isTie
      ? `${t('wwShareTieHeader')} ${winnerCard.title} vs ${loserCard.title}`
      : `${winnerCard.title} (${formatViews(winnerCard.views)}) > ${loserCard.title} (${formatViews(loserCard.views)})`,
    guessedRight ? t('wwShareRight') : t('wwShareWrong'),
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
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ww-share-title"
        className="w-full max-w-md bg-panel border border-border-strong rounded-t-3xl p-5 flex flex-col gap-4 slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border-strong rounded-full mx-auto" />
        <p id="ww-share-title" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-text text-center">
          <Icon name="wikiWarsStats" className="h-4 w-4 text-emerald-300" />
          {t('wwShareTitle')}
        </p>

        <div className="bg-card border border-border-strong rounded-2xl p-4 max-h-44 overflow-y-auto scrollbar-none">
          <pre className="text-xs text-text whitespace-pre-wrap font-mono leading-relaxed">{shareText}</pre>
        </div>

        <div className="flex flex-col gap-2">
          {canShare && (
            <button onClick={shareNative}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="phone" className="h-4 w-4" />
              {t('shareVia')}
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank'); onClose() }}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="whatsapp" className="h-4 w-4" />
              WhatsApp
            </button>
            <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank'); onClose() }}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="twitter" className="h-4 w-4" />
              Twitter
            </button>
          </div>
          <button onClick={copyText}
            className="w-full py-3 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            <Icon name={copied ? 'check' : 'clipboard'} className="h-4 w-4" />
            {copied ? t('shareCopied') : t('copyText')}
          </button>
        </div>
        <button onClick={onClose} className="text-muted text-sm text-center py-1">{t('shareAnnuler')}</button>
      </div>
    </div>,
    document.body
  )
}

// ─── Main WikiWars component ──────────────────────────────────────────────────

export default function WikiWars() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { suddenDeathEnabled } = useSettings()
  const { profile, addGameResult } = useProfile()
  const [phase, setPhase]         = useState<Phase>('loading')
  const [cards, setCards]         = useState<[PageviewsData, PageviewsData] | null>(null)
  const [selected, setSelected]   = useState<0 | 1 | null>(null)
  const [error, setError]         = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [suddenDeathRemaining, setSuddenDeathRemaining] = useState(SUDDEN_DEATH_SECONDS)
  const loadRequestId = useRef(0)
  const suddenDeathResultRecorded = useRef(false)

  const loadDuel = useCallback(async () => {
    const requestId = ++loadRequestId.current
    setPhase('loading')
    setSelected(null)
    setCards(null)
    setError(false)
    setShowShare(false)
    setSuddenDeathRemaining(SUDDEN_DEATH_SECONDS)
    suddenDeathResultRecorded.current = false
    try {
      const [a, b] = await Promise.all([fetchSummaryForWikiWars(), fetchSummaryForWikiWars()])
      const pair: [PageviewsData, PageviewsData] = a.title === b.title
        ? [a, await fetchSummaryForWikiWars()]
        : [a, b]
      if (requestId !== loadRequestId.current) return
      setCards(pair)
      setPhase('vote')
    } catch {
      if (requestId !== loadRequestId.current) return
      setError(true)
      setPhase('vote')
    }
  }, [])

  useEffect(() => { loadDuel() }, [loadDuel])

  useEffect(() => {
    if (!suddenDeathEnabled || phase !== 'vote' || !cards) {
      setSuddenDeathRemaining(SUDDEN_DEATH_SECONDS)
      return
    }

    setSuddenDeathRemaining(SUDDEN_DEATH_SECONDS)
    const deadline = Date.now() + SUDDEN_DEATH_SECONDS * 1000

    const timerId = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSuddenDeathRemaining(next)
      if (next === 0) {
        window.clearInterval(timerId)
        setShowShare(false)
        if (!suddenDeathResultRecorded.current) {
          suddenDeathResultRecorded.current = true
          addGameResult({
            outcome: 'LOSS',
            mode: 'wikiwars',
            suddenDeath: true
          })
        }
        setPhase('sudden-death')
      }
    }, 250)

    return () => window.clearInterval(timerId)
  }, [addGameResult, suddenDeathEnabled, phase, cards])

  function handleVote(index: 0 | 1) {
    if (phase !== 'vote' || !cards) return
    suddenDeathResultRecorded.current = true
    setSelected(index)
    setPhase('reveal')

    const currentWinner = cards[0].views === cards[1].views ? 'tie' : (cards[0].views > cards[1].views ? 0 : 1)
    const outcome = currentWinner === 'tie' ? 'DRAW' : (currentWinner === index ? 'WIN' : 'LOSS')

    addGameResult({
      outcome,
      mode: 'wikiwars',
      suddenDeath: suddenDeathEnabled
    })
  }

  function getWinner(): 0 | 1 | 'tie' {
    if (!cards) return 0
    if (cards[0].views === cards[1].views) return 'tie'
    return cards[0].views > cards[1].views ? 0 : 1
  }

  const winner       = getWinner()
  const isTie        = winner === 'tie'
  const guessedRight = isTie || selected === winner
  const isSuddenDeathExpired = phase === 'sudden-death'

  function getResultMessage() {
    if (isTie)        return t('wwTie')
    if (guessedRight) return t('wwRight')
    return t('wwWrong')
  }
  function getResultIcon() {
    if (isTie) return 'handshake'
    if (guessedRight) return 'check'
    return 'x'
  }
  function getResultColor() {
    if (isTie)        return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <Icon name="wikiWarsStats" className="h-12 w-12 animate-pulse text-purple-300" />
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
        <button onClick={loadDuel} className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm">
          <Icon name="refresh" className="h-4 w-4" />
          {t('duelRetry')}
        </button>
        <button onClick={() => navigate('/')} className="text-muted text-xs underline">{t('duelBackHome')}</button>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-base">
      {cards && (
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-3 left-3 z-30 text-white/60 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
            aria-label={t('backHome')}
          >
            {E.arrowLeft}
          </button>

          {profile && profile.stats.currentStreak >= 2 && (
            <div className="absolute top-3 right-3 z-30 text-yellow-400 font-bold text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <Icon name="flame" className="h-5 w-5" />
              {profile.stats.currentStreak}
            </div>
          )}

          {([0, 1] as const).map((i) => {
            const card     = cards[i]
            const isWinner = phase === 'reveal' && (winner === i || isTie)
            const isLoser  = phase === 'reveal' && !isWinner

            return (
              <WikiWarsCard
                key={i}
                index={i}
                card={card}
                isWinner={isWinner}
                isLoser={isLoser}
                isSuddenDeathExpired={isSuddenDeathExpired}
                phase={phase}
                onVote={handleVote}
                t={t}
              />
            )
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {suddenDeathEnabled && phase === 'vote' ? (
              <span className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-base font-black tabular-nums shadow-[0_0_24px_rgba(239,68,68,0.55)] ${
                suddenDeathRemaining === 1
                  ? 'border-red-200 bg-red-700 text-white shadow-[0_0_30px_rgba(254,202,202,0.95)]'
                  : 'border-red-400 bg-red-950 text-red-100'
              } ${
                suddenDeathRemaining <= 3 ? 'sudden-death-pulse' : ''
              }`}>
                {suddenDeathRemaining}
              </span>
            ) : (
              <span className="bg-base border border-purple-600 text-text font-extrabold text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                VS
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-base border-t border-border px-3 py-2.5">
        {phase === 'vote' && (
          <p className="flex items-center justify-center gap-1.5 text-center text-muted text-xs py-1">
            <VoteArrow className="text-yellow-400 text-sm" />
            {t('wwInstruction')}
          </p>
        )}
        {phase === 'reveal' && cards && (
          <div className="flex flex-col gap-2 fade-in">
            <p className={`flex items-center justify-center gap-1.5 text-center text-sm font-bold ${getResultColor()}`}>
              <Icon name={getResultIcon()} className="h-4 w-4" />
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
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
              >
                <Icon name="refresh" className="h-4 w-4" />
                {t('replay')}
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

      {isSuddenDeathExpired && (
        <SuddenDeathOverlay onReturnHome={() => navigate('/')} />
      )}
    </main>
  )
}

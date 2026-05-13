import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticleData, fetchArticleFromCategory, fetchArticleByTitle, type ArticleData } from '../api/wikipedia'
import { computeDramaScore, isLegendary } from '../utils/dramaScore'
import eyeLogoRaw from '../assets/eye-logo.svg?raw'
import { useSettings } from '../context/SettingsContext'
import { useProfile } from '../context/ProfileContext'
import DuelCard from '../components/DuelCard'
import CategoryPicker from '../components/CategoryPicker'
import ShareButton from '../components/ShareButton'
import Icon from '../components/Icon'
import SuddenDeathOverlay from '../components/SuddenDeathOverlay'
import VoteArrow from '../components/VoteArrow'

type Phase = 'pick-category' | 'loading' | 'vote' | 'reveal' | 'sudden-death'
export type WinnerState = 0 | 1 | 'tie'

const SUDDEN_DEATH_SECONDS = 5

function FolderIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-300 ring-1 ring-white/10">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 6.5a2 2 0 0 1 2-2h4.2l2 2H18a2 2 0 0 1 2 2v1H3.5z" />
        <path d="M3.5 9.5h17l-1.3 8.1a2 2 0 0 1-2 1.7H6.8a2 2 0 0 1-2-1.7z" />
      </svg>
    </span>
  )
}

function LoadingDuelIcon() {
  return (
    <span className="duel-loading-logo" aria-hidden="true">
      <span className="duel-loading-logo__svg" dangerouslySetInnerHTML={{ __html: eyeLogoRaw }} />
    </span>
  )
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export default function Duel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { suddenDeathEnabled } = useSettings()
  const { profile, addGameResult } = useProfile()
  const mode = searchParams.get('mode') || 'random'

  const [phase, setPhase]       = useState<Phase>(mode === 'random' ? 'loading' : 'pick-category')
  const [category, setCategory] = useState('Politique')
  const [articles, setArticles] = useState<[ArticleData, ArticleData] | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [suddenDeathRemaining, setSuddenDeathRemaining] = useState(SUDDEN_DEATH_SECONDS)
  const loadRequestId = useRef(0)
  const suddenDeathResultRecorded = useRef(false)

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

  const loadDuel = useCallback(async (cat?: string, sharedA?: string, sharedB?: string) => {
    const requestId = ++loadRequestId.current
    if (isOffline()) { setError('offline'); setPhase('vote'); return }
    setPhase('loading')
    setSelected(null)
    setArticles(null)
    setError(null)
    setSuddenDeathRemaining(SUDDEN_DEATH_SECONDS)
    suddenDeathResultRecorded.current = false
    try {
      let pair: [ArticleData, ArticleData]
      if (sharedA && sharedB) {
        const [langA, ...titleAParts] = sharedA.split(':')
        const [langB, ...titleBParts] = sharedB.split(':')
        pair = await Promise.all([
          fetchArticleByTitle(titleAParts.join(':'), langA as any),
          fetchArticleByTitle(titleBParts.join(':'), langB as any)
        ])
      } else {
        pair = await fetchDistinctPair(cat)
      }
      if (requestId !== loadRequestId.current) return
      setArticles(pair)
      setPhase('vote')
    } catch (err: unknown) {
      if (requestId !== loadRequestId.current) return
      const msg = err instanceof Error ? err.message : ''
      setError(msg.includes('AbortError') || isOffline() ? 'offline' : 'generic')
      setPhase('vote')
    }
  }, [fetchDistinctPair])

  useEffect(() => {
    const paramA = searchParams.get('a')
    const paramB = searchParams.get('b')
    if (paramA && paramB) {
      loadDuel(undefined, paramA, paramB)
    } else if (mode === 'random') {
      loadDuel()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, loadDuel])

  useEffect(() => {
    if (!suddenDeathEnabled || phase !== 'vote' || !articles) {
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
        if (!suddenDeathResultRecorded.current) {
          suddenDeathResultRecorded.current = true
          addGameResult({
            outcome: 'LOSS',
            mode,
            category: mode === 'thematic' ? category : undefined,
            suddenDeath: true,
            protectedArticles: articles.filter((article) => article.stats.protected).length,
            legendaryArticles: articles.map((article) => computeDramaScore(article.stats)).filter(isLegendary).length
          })
        }
        setPhase('sudden-death')
      }
    }, 250)

    return () => window.clearInterval(timerId)
  }, [addGameResult, category, mode, suddenDeathEnabled, phase, articles])

  function handleVote(index: 0 | 1) {
    if (phase !== 'vote' || !articles) return
    suddenDeathResultRecorded.current = true
    setSelected(index)
    setPhase('reveal')

    const scoreA = computeDramaScore(articles[0].stats)
    const scoreB = computeDramaScore(articles[1].stats)
    const currentWinner = scoreA === scoreB ? 'tie' : (scoreA > scoreB ? 0 : 1)
    
    const outcome = currentWinner === 'tie' ? 'DRAW' : (currentWinner === index ? 'WIN' : 'LOSS')
    addGameResult({
      outcome,
      mode,
      category: mode === 'thematic' ? category : undefined,
      suddenDeath: suddenDeathEnabled,
      protectedArticles: articles.filter((article) => article.stats.protected).length,
      legendaryArticles: [scoreA, scoreB].filter(isLegendary).length
    })
  }

  function getWinner(): WinnerState {
    if (!articles) return 0
    const scoreA = computeDramaScore(articles[0].stats)
    const scoreB = computeDramaScore(articles[1].stats)
    if (scoreA === scoreB) return 'tie'
    return scoreA > scoreB ? 0 : 1
  }

  const winner      = getWinner()
  const isTie       = winner === 'tie'
  const guessedRight = isTie || selected === winner
  const isSuddenDeathExpired = phase === 'sudden-death'

  function getResultMessage(): string {
    if (isTie)        return t('duelTie')
    if (guessedRight) return t('duelRight')
    return t('duelWrong')
  }

  function getResultIcon() {
    if (isTie) return 'handshake'
    if (guessedRight) return 'check'
    return 'x'
  }

  function getResultColor(): string {
    if (isTie)        return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  if (phase === 'pick-category') {
    return (
      <main className="flex h-dvh min-h-0 flex-col gap-5 overflow-hidden px-4 py-6">
        <div className="flex flex-shrink-0 items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-muted hover:text-text hover:bg-white/10 ring-1 ring-white/10 transition-all active:scale-95"
            aria-label={t('backHome')}
            title={t('backHome')}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <h1 className="flex items-center gap-2 font-bold text-base text-text">
            <FolderIcon />
            {t('duelThematic')}
          </h1>
          <div className="w-16" />
        </div>
        <CategoryPicker
          onChange={setCategory}
          onPlay={(cat) => loadDuel(cat)}
        />
      </main>
    )
  }

  if (phase === 'loading') {
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <LoadingDuelIcon />
        <p className="text-muted text-sm">{t('duelLoading')}</p>
      </main>
    )
  }

  if (error) {
    const isOfflineError = error === 'offline'
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl border backdrop-blur-sm ${
          isOfflineError
            ? 'border-red-400/20 bg-red-500/10 text-red-300'
            : 'border-border-strong bg-card/80 text-text'
        }`}>
          <Icon name={isOfflineError ? 'wifiOff' : 'alertCircle'} className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-white font-bold">
            {t(isOfflineError ? 'duelOfflineTitle' : 'duelErrorTitle')}
          </p>
          <p className="text-muted text-sm">
            {t(isOfflineError ? 'duelOfflineMsg' : 'duelErrorMsg')}
          </p>
        </div>
        <button
          onClick={() => loadDuel(mode === 'thematic' ? category : undefined)}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm"
        >
          <Icon name="refresh" className="h-4 w-4" />
          {t('duelRetry')}
        </button>
        <button onClick={() => navigate('/')} className="text-muted text-xs underline">
          {t('duelBackHome')}
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-base">
      {articles && (
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-3 left-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-black/35 text-white/70 ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-black/45 hover:text-white active:scale-95"
            aria-label={t('backHome')}
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
          </button>

          {profile && profile.stats.currentStreak >= 2 && (
            <div className="absolute top-3 right-3 z-30 text-yellow-400 font-bold text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <Icon name="flame" className="h-5 w-5" />
              {profile.stats.currentStreak}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <DuelCard
              data={articles[0]}
              revealed={phase === 'reveal'}
              selected={selected === 0}
              winner={phase === 'reveal' && (winner === 0 || isTie)}
              onClick={() => handleVote(0)}
              position="top"
              disabled={isSuddenDeathExpired}
              dimmed={isSuddenDeathExpired}
            />
          </div>

          <div className="relative z-20 flex items-center justify-center h-0 flex-shrink-0">
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
              <span className="bg-base border border-border-strong text-text font-extrabold text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                VS
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <DuelCard
              data={articles[1]}
              revealed={phase === 'reveal'}
              selected={selected === 1}
              winner={phase === 'reveal' && (winner === 1 || isTie)}
              onClick={() => handleVote(1)}
              position="bottom"
              disabled={isSuddenDeathExpired}
              dimmed={isSuddenDeathExpired}
            />
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-base border-t border-border px-3 py-2.5">
        {phase === 'vote' && (
          <p className="flex items-center justify-center gap-1.5 text-center text-muted text-xs py-1">
            <VoteArrow className="text-yellow-400 text-sm" />
            {t('duelTapArticle')}
          </p>
        )}
        {phase === 'reveal' && articles && (
          <div className="flex flex-col gap-2 fade-in">
            <p className={`flex items-center justify-center gap-1.5 text-center text-sm font-bold ${getResultColor()}`}>
              <Icon name={getResultIcon()} className="h-4 w-4" />
              {getResultMessage()}
            </p>
            <div className="flex gap-2">
              <ShareButton articles={articles} winner={winner} selected={selected} />
              <button
                onClick={() => {
                  if (searchParams.has('a') || searchParams.has('b')) {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('a')
                    newParams.delete('b')
                    navigate(`/?${newParams.toString()}`, { replace: true })
                  }
                  mode === 'thematic' ? loadDuel(category) : loadDuel()
                }}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
              >
                <Icon name="refresh" className="h-4 w-4" />
                {t('replay')}
              </button>
            </div>
          </div>
        )}
      </div>

      {isSuddenDeathExpired && (
        <SuddenDeathOverlay onReturnHome={() => navigate('/')} />
      )}
    </main>
  )
}


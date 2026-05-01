import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticleData, fetchArticleFromCategory, type ArticleData } from '../api/wikipedia'
import { computeDramaScore } from '../utils/dramaScore'
import { E } from '../utils/emojis'
import DuelCard from '../components/DuelCard'
import CategoryPicker from '../components/CategoryPicker'
import ShareButton from '../components/ShareButton'

type Phase = 'pick-category' | 'loading' | 'vote' | 'reveal'
export type WinnerState = 0 | 1 | 'tie'

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

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export default function Duel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const mode = searchParams.get('mode') || 'random'

  const [phase, setPhase]       = useState<Phase>(mode === 'random' ? 'loading' : 'pick-category')
  const [category, setCategory] = useState('Politique')
  const [articles, setArticles] = useState<[ArticleData, ArticleData] | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [error, setError]       = useState<string | null>(null)

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
    if (isOffline()) { setError('offline'); setPhase('vote'); return }
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
      setError(msg.includes('AbortError') || isOffline() ? 'offline' : 'generic')
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

  const winner      = getWinner()
  const isTie       = winner === 'tie'
  const guessedRight = isTie || selected === winner

  function getResultMessage(): string {
    if (isTie)        return `${E.handshake} ${t('duelTie')}`
    if (guessedRight) return `${E.checkmark} ${t('duelRight')}`
    return `${E.cross} ${t('duelWrong')}`
  }

  function getResultColor(): string {
    if (isTie)        return 'text-yellow-400'
    if (guessedRight) return 'text-green-400'
    return 'text-red-400'
  }

  if (phase === 'pick-category') {
    return (
      <main className="flex flex-col flex-1 px-4 py-6 gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-muted text-sm">
            {E.arrowLeft} {t('backHome')}
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
        <div className="text-4xl animate-pulse">{E.swords}</div>
        <p className="text-muted text-sm">{t('duelLoading')}</p>
      </main>
    )
  }

  if (error) {
    const isOfflineError = error === 'offline'
    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">{isOfflineError ? E.satellite : E.noEntry}</span>
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
          className="py-2.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm"
        >
          {E.reload} {t('duelRetry')}
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
            className="absolute top-3 left-3 z-30 text-white/60 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
            aria-label={t('backHome')}
          >
            {E.arrowLeft}
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
            <span className="bg-base border border-border-strong text-text font-extrabold text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
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

      <div className="flex-shrink-0 bg-base border-t border-border px-3 py-2.5">
        {phase === 'vote' && (
          <p className="text-center text-muted text-xs py-1">
            {E.finger} {t('duelTapArticle')}
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
                {E.reload} {t('replay')}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

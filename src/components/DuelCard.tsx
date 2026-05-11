import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaTier, getDramaTierKey, isLegendary, isEnormous } from '../utils/dramaScore'
import Icon from './Icon'
import VoteArrow from './VoteArrow'

interface Props {
  data: ArticleData
  revealed: boolean
  selected: boolean
  winner: boolean
  onClick: () => void
  position: 'top' | 'bottom'
  disabled?: boolean
  dimmed?: boolean
}

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

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

type StatIconName = 'pencil' | 'users' | 'reset' | 'anon' | 'eye' | 'minor'

interface RevealStatProps {
  icon: StatIconName
  value: string
  label: string
}

function RevealStat({ icon, value, label }: RevealStatProps) {
  return (
    <div className="duel-glass-tile flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1">
      <span className="duel-glass-icon flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white/72">
        <Icon name={icon} className="h-3.5 w-3.5" />
      </span>
      <div className="flex min-w-0 items-baseline gap-1 leading-none">
        <p className="shrink-0 text-[11px] font-semibold text-white">{value}</p>
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.07em] text-white/43">{label}</p>
      </div>
    </div>
  )
}

export default function DuelCard({ data, revealed, winner, onClick, position, disabled = false, dimmed = false }: Props) {
  const { t } = useTranslation()
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const tier = getDramaTier(score)
  const colorText = getDramaColor(score)
  const colorBar  = getDramaBarColor(score)
  const isLoser   = revealed && !winner
  const legendary = isLegendary(score)
  const enormous  = isEnormous(score)
  const tierIconName =
    tier === 'legendary' ? 'diamond1'
    : tier === 'enormous' ? 'terror'
    : tier === 'chaos' ? 'daemonSkull'
    : tier === 'agitated' ? 'theatre'
    : tier === 'disputed' ? 'megaphone'
    : 'dramaTierDefault'

  const displayedScore = useCountUp(score, revealed)

  const shortExtract = article.extract
    ? article.extract.split('.').slice(0, 2).join('.') + '.'
    : null

  const layoutClass =
    position === 'top'
      ? 'justify-end px-5 pb-6 pt-14'
      : 'justify-start px-5 pb-14 pt-6'

  const imageOverlay =
    position === 'top'
      ? 'bg-gradient-to-b from-black/10 via-black/35 to-black/85'
      : 'bg-gradient-to-t from-black/10 via-black/35 to-black/85'

  const tintOverlay =
    legendary && revealed
      ? 'bg-sky-500/15'
      : enormous && revealed
        ? 'bg-yellow-400/12'
        : winner && revealed
          ? 'bg-red-500/10'
          : 'bg-black/10'

  const winnerBadgeClass = legendary
    ? 'bg-sky-500/85 text-white legendary-badge-glow'
    : enormous
      ? 'bg-yellow-400 text-slate-900 enormous-badge-glow'
      : 'bg-red-500/85 text-white'

  return (
    <button
      onClick={onClick}
      disabled={revealed || disabled}
      className={`group relative h-full w-full overflow-hidden transition-[opacity,transform,filter] duration-300
        ${dimmed || isLoser ? 'opacity-45 saturate-[0.85]' : 'opacity-100'}
        ${!revealed && !disabled ? 'active:scale-[1.01] active:brightness-110' : ''}
      `}
    >
      {article.thumbnail ? (
        <img src={article.thumbnail} alt={article.title}
          className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      <div className={`absolute inset-0 ${imageOverlay}`} />
      <div className={`absolute inset-0 ${tintOverlay}`} />

      {legendary && revealed && <div className="absolute inset-0 pointer-events-none legendary-shimmer" />}
      {enormous  && revealed && <div className="absolute inset-0 pointer-events-none enormous-shimmer" />}
      {winner && revealed && !legendary && !enormous && (
        <div className="absolute inset-0 border-4 border-red-400/80 pointer-events-none" />
      )}

      <div className={`relative z-10 flex h-full flex-col items-center ${layoutClass}`}>
        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          {winner && revealed && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${winnerBadgeClass}`}>
              <Icon name="trophy" className="h-3.5 w-3.5" />
              {t('tierWinner')}
            </div>
          )}

          <h2 className="max-w-[18rem] text-center text-xl font-extrabold leading-tight text-white drop-shadow-lg">
            {article.title}
          </h2>

          {!revealed && shortExtract && (
            <p className="duel-glass-panel duel-description-scroll w-full max-w-sm max-h-28 overflow-y-auto rounded-2xl px-4 py-3 text-center text-[13px] leading-relaxed text-white/88">
              {shortExtract}
            </p>
          )}

          {!revealed && (
            <span className="duel-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/78">
              <VoteArrow />
              {t('wwVote')}
            </span>
          )}

          {revealed && (
            <div className="fade-in flex w-full max-w-sm flex-col items-center gap-2.5">
              <span className={`font-extrabold text-4xl drop-shadow-lg ${colorText} ${
                legendary ? 'legendary-text-glow' : enormous ? 'enormous-text-glow' : ''
              }`}>
                {displayedScore}%
              </span>

              <p className={`inline-flex items-center gap-1.5 text-sm font-semibold ${colorText}`}>
                <Icon name={tierIconName} className="h-4 w-4" />
                {t(getDramaTierKey(score))}
              </p>

              {stats.protected && (
                <span className="duel-glass-chip inline-flex items-center gap-1.5 rounded-full border-orange-400/35 px-3 py-1 text-xs font-semibold text-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.12)]">
                  <Icon name="lockFill" className="h-3.5 w-3.5" />
                  {t('tierProtected')}
                </span>
              )}

              <div className="h-1.5 w-full rounded-full bg-white/20">
                <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
              </div>

              <div className="duel-glass-panel grid w-full max-w-[18rem] grid-cols-2 gap-x-1.5 gap-y-0.5 rounded-xl px-1.5 py-1 text-white/80">
                <RevealStat icon="pencil" value={fmt(stats.editCount)} label={t('statEdits')} />
                <RevealStat icon="users" value={fmt(stats.uniqueEditors)} label={t('tierEditors')} />
                <RevealStat icon="reset" value={`${stats.reversionRate}%`} label={t('statRev')} />
                <RevealStat icon="anon" value={`${Math.round(stats.anonRate * 100)}%`} label={t('statAnon')} />
                <RevealStat icon="eye" value={fmt(stats.watchers)} label={t('statWatch')} />
                <RevealStat icon="minor" value={`${Math.round(stats.minorRate * 100)}%`} label={t('statMinor')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

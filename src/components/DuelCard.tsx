import { useTranslation } from 'react-i18next'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaTierKey, getDramaTierEmoji, isLegendary, isEnormous } from '../utils/dramaScore'
import { E } from '../utils/emojis'

interface Props {
  data: ArticleData
  revealed: boolean
  selected: boolean
  winner: boolean
  onClick: () => void
  position: 'top' | 'bottom'
}

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function DuelCard({ data, revealed, selected, winner, onClick }: Props) {
  const { t } = useTranslation()
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const colorText = getDramaColor(score)
  const colorBar  = getDramaBarColor(score)
  const isLoser   = revealed && !winner
  const legendary = isLegendary(score)
  const enormous  = isEnormous(score)

  const shortExtract = article.extract
    ? article.extract.split('.').slice(0, 2).join('.') + '.'
    : null

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={`relative w-full h-full overflow-hidden transition-all
        ${ isLoser ? 'opacity-50' : 'opacity-100' }
        ${ !revealed ? 'active:brightness-110' : '' }
      `}
    >
      {article.thumbnail ? (
        <img src={article.thumbnail} alt={article.title}
          className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      <div className={`absolute inset-0 ${
        legendary && revealed ? 'bg-sky-950/50' :
        enormous  && revealed ? 'bg-yellow-950/40' :
        winner    && revealed ? 'bg-black/40' : 'bg-black/60'
      }`} />

      {legendary && revealed && <div className="absolute inset-0 pointer-events-none legendary-shimmer" />}
      {enormous  && revealed && <div className="absolute inset-0 pointer-events-none enormous-shimmer" />}
      {winner && revealed && !legendary && !enormous && (
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">

        {winner && revealed && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            legendary ? 'bg-sky-500/80 text-white legendary-badge-glow' :
            enormous  ? 'bg-yellow-400 text-slate-900 enormous-badge-glow' :
            'bg-yellow-400 text-slate-900'
          }`}>
            {legendary
              ? `${E.legendary} ${t('tierLegendary')}`
              : enormous
              ? `${E.enormous} ${t('tierEnormous')}`
              : `${E.winner} ${t('tierWinner')}`}
          </div>
        )}

        <h2 className="text-white font-extrabold text-xl text-center leading-tight drop-shadow-lg">
          {article.title}
        </h2>

        {shortExtract && (
          <p className="text-white/90 text-xs text-center leading-relaxed bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-sm line-clamp-3 w-full">
            {shortExtract}
          </p>
        )}

        {!revealed && (
          <span className="text-white/80 font-medium text-xs border-2 border-white/30 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            {E.vote} {t('wwVote')}
          </span>
        )}

        {revealed && (
          <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
            <span className={`font-extrabold text-4xl drop-shadow-lg ${colorText} ${
              legendary ? 'legendary-text-glow' : enormous ? 'enormous-text-glow' : ''
            }`}>
              {score}%
            </span>
            <p className={`text-xs font-semibold ${colorText}`}>
              {getDramaTierEmoji(score)} {t(getDramaTierKey(score))}
            </p>

            {stats.protected && (
              <span className="text-orange-400 text-xs font-semibold flex items-center gap-1">
                {E.protected} {t('tierProtected')}
              </span>
            )}

            <div className="w-full h-1.5 rounded-full bg-white/20">
              <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-white/80 text-xs bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 w-full">
              <span>{E.edit} {fmt(stats.editCount)} {t('statEdits')}</span>
              <span>{E.editors} {fmt(stats.uniqueEditors)} {t('tierEditors')}</span>
              <span>{E.revert} {stats.reversionRate}% {t('statRev')}</span>
              <span>{E.anon} {Math.round(stats.anonRate * 100)}% {t('statAnon')}</span>
              <span>{E.watch} {fmt(stats.watchers)} {t('statWatch')}</span>
              <span>{E.minor} {Math.round(stats.minorRate * 100)}% {t('statMinor')}</span>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

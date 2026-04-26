import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaLabel, isLegendary, isEnormous } from '../utils/dramaScore'

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
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const colorText = getDramaColor(score)
  const colorBar = getDramaBarColor(score)
  const isLoser = revealed && !winner
  const legendary = isLegendary(score)
  const enormous = isEnormous(score)

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

      {legendary && revealed && (
        <div className="absolute inset-0 pointer-events-none legendary-shimmer" />
      )}
      {enormous && revealed && (
        <div className="absolute inset-0 pointer-events-none enormous-shimmer" />
      )}
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
            {legendary ? '\ud83d\udc8e L\u00e9gendaire' : enormous ? '\ud83c\udf1f \u00c9norme Drama' : '\ud83c\udfc6 Plus drama'}
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
          <span className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1">Voter \u2191</span>
        )}

        {revealed && (
          <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
            <span className={`font-extrabold text-4xl drop-shadow-lg ${colorText} ${
              legendary ? 'legendary-text-glow' : enormous ? 'enormous-text-glow' : ''
            }`}>
              {score}%
            </span>
            <p className={`text-xs font-semibold ${colorText}`}>{getDramaLabel(score)}</p>

            {/* Badge protection — visible uniquement après révélation */}
            {stats.protected && (
              <span className="text-orange-400 text-xs font-semibold flex items-center gap-1">
                \ud83d\udd12 Prot\u00e9g\u00e9 par Wikipedia
              </span>
            )}

            <div className="w-full h-1.5 rounded-full bg-white/20">
              <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-white/80 text-xs
              bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 w-full">
              <span>\u270f\ufe0f {fmt(stats.editCount)} edits</span>
              <span>\ud83d\udc65 {fmt(stats.uniqueEditors)} \u00e9diteurs</span>
              <span>\u21a9\ufe0f {stats.reversionRate}% rev.</span>
              <span>\ud83d\udc7b {Math.round(stats.anonRate * 100)}% anon</span>
              <span>\ud83d\udc41\ufe0f {fmt(stats.watchers)} watch</span>
              <span>\u2702\ufe0f {Math.round(stats.minorRate * 100)}% minor</span>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

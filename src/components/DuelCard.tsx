import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaLabel, isLegendary } from '../utils/dramaScore'

interface Props {
  data: ArticleData
  revealed: boolean
  selected: boolean
  winner: boolean
  onClick: () => void
  position: 'top' | 'bottom'
}

export default function DuelCard({ data, revealed, selected, winner, onClick }: Props) {
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const colorText = getDramaColor(score)
  const colorBar = getDramaBarColor(score)
  const isLoser = revealed && !winner
  const legendary = isLegendary(score)

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
      {/* Background */}
      {article.thumbnail ? (
        <img src={article.thumbnail} alt={article.title}
          className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${
        legendary && revealed ? 'bg-purple-950/50' :
        winner && revealed    ? 'bg-black/40' : 'bg-black/60'
      }`} />

      {/* Legendary shimmer border */}
      {legendary && revealed && (
        <div className="absolute inset-0 pointer-events-none legendary-shimmer" />
      )}

      {/* Winner border (non-legendary) */}
      {winner && revealed && !legendary && (
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">

        {/* Badge winner */}
        {winner && revealed && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            legendary
              ? 'bg-purple-500 text-white legendary-badge-glow'
              : 'bg-yellow-400 text-slate-900'
          }`}>
            {legendary ? '💎 Légendaire' : '🏆 Plus drama'}
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
          <span className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1">
            Voter ↑
          </span>
        )}

        {revealed && (
          <div className="flex flex-col items-center gap-1.5 fade-in w-full max-w-xs">
            <span className={`font-extrabold text-4xl drop-shadow-lg ${colorText} ${
              legendary ? 'legendary-text-glow' : ''
            }`}>
              {score}%
            </span>
            <p className={`text-xs font-semibold ${colorText}`}>{getDramaLabel(score)}</p>
            <div className="w-full h-1.5 rounded-full bg-white/20">
              <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="flex gap-2 text-white/60 text-xs flex-wrap justify-center">
              <span>✏️ {stats.editCount.toLocaleString()}</span>
              <span>👥 {stats.uniqueEditors}</span>
              <span>↩️ {stats.reversionRate}%</span>
              <span>⚡ {stats.recentEdits}/30j</span>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

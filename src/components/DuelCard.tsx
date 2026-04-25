import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaLabel } from '../utils/dramaScore'

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

  const shortExtract = article.extract
    ? article.extract.split('.')[0] + '.'
    : null

  // Affiche "500+" si XTools a échoué mais qu'on sait qu'on est capé
  const editDisplay = stats.cappedAt500
    ? '500+'
    : stats.editCount.toLocaleString()

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
      <div className={`absolute inset-0 ${ winner && revealed ? 'bg-black/40' : 'bg-black/60' }`} />

      {/* Winner border */}
      {winner && revealed && (
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 gap-2">

        {winner && revealed && (
          <span className="text-xs font-bold bg-yellow-400 text-slate-900 px-2.5 py-0.5 rounded-full">
            🏆 Plus drama
          </span>
        )}

        <h2 className="text-white font-extrabold text-xl text-center leading-tight drop-shadow-lg">
          {article.title}
        </h2>

        {shortExtract && (
          <p className="text-white/80 text-xs text-center leading-relaxed bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-xs line-clamp-2">
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
            <span className={`font-extrabold text-4xl drop-shadow-lg ${colorText}`}>
              {score}%
            </span>
            <p className={`text-xs font-semibold ${colorText}`}>{getDramaLabel(score)}</p>
            <div className="w-full h-1.5 rounded-full bg-white/20">
              <div className={`h-1.5 rounded-full fill-bar ${colorBar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="flex gap-2 text-white/60 text-xs flex-wrap justify-center">
              <span>✏️ {editDisplay}</span>
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

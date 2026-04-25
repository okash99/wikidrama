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

export default function DuelCard({ data, revealed, selected, winner, onClick, position }: Props) {
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const colorText = getDramaColor(score)
  const colorBar = getDramaBarColor(score)

  const isLoser = revealed && selected && !winner

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={`relative w-full flex-1 overflow-hidden transition-all
        ${ position === 'top' ? '' : '' }
        ${ isLoser ? 'opacity-50' : 'opacity-100' }
        ${ !revealed ? 'active:brightness-110' : '' }
      `}
    >
      {/* Background image or gradient */}
      {article.thumbnail ? (
        <img
          src={article.thumbnail}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      {/* Dark overlay */}
      <div className={`absolute inset-0 ${ winner && revealed ? 'bg-black/40' : 'bg-black/55' }`} />

      {/* Winner glow border */}
      {winner && revealed && (
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-6 gap-3">

        {/* Winner badge */}
        {winner && revealed && (
          <span className="text-xs font-bold bg-yellow-400 text-slate-900 px-3 py-1 rounded-full">
            🏆 Plus drama
          </span>
        )}

        {/* Title */}
        <h2 className="text-white font-extrabold text-2xl text-center leading-tight drop-shadow-lg">
          {article.title}
        </h2>

        {/* Pre-reveal CTA */}
        {!revealed && (
          <span className="text-white/60 text-sm border border-white/30 rounded-full px-4 py-1">
            Voter ↑
          </span>
        )}

        {/* Post-reveal score */}
        {revealed && (
          <div className="flex flex-col items-center gap-2 fade-in w-full max-w-xs">
            <span className={`font-extrabold text-5xl drop-shadow-lg ${colorText}`}>
              {score}%
            </span>
            <p className={`text-sm font-semibold ${colorText}`}>{getDramaLabel(score)}</p>

            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-white/20">
              <div
                className={`h-2 rounded-full fill-bar ${colorBar}`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Stats inline */}
            <div className="flex gap-3 text-white/70 text-xs flex-wrap justify-center">
              <span>✏️ {stats.editCount} édits</span>
              <span>👥 {stats.uniqueEditors} éditeurs</span>
              <span>↩️ {stats.reversionRate}%</span>
              <span>⚡ {stats.recentEdits}/30j</span>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

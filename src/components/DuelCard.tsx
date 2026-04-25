import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaColor, getDramaBarColor, getDramaLabel } from '../utils/dramaScore'

interface Props {
  data: ArticleData
  revealed: boolean
  selected: boolean
  winner: boolean
  onClick: () => void
}

export default function DuelCard({ data, revealed, selected, winner, onClick }: Props) {
  const { article, stats } = data
  const score = computeDramaScore(stats)
  const colorText = getDramaColor(score)
  const colorBar = getDramaBarColor(score)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border transition-all active:scale-95 overflow-hidden
        ${
          selected && winner
            ? 'border-yellow-400 bg-slate-800 shadow-lg shadow-yellow-400/20'
            : selected
            ? 'border-slate-500 bg-slate-800'
            : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
        }
      `}
    >
      {/* Thumbnail */}
      {article.thumbnail && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <h2 className="font-bold text-lg leading-tight line-clamp-2">
          {winner && revealed && '🏆 '}{article.title}
        </h2>

        {/* Extract */}
        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {article.extract}
        </p>

        {/* Drama Score */}
        {revealed ? (
          <div className="flex flex-col gap-2">
            {/* Score bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Drama Score</span>
              <span className={`font-extrabold text-2xl ${colorText}`}>{score}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${colorBar}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className={`text-sm font-semibold ${colorText}`}>{getDramaLabel(score)}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <StatBadge icon="✏️" label="Éditions" value={stats.editCount} />
              <StatBadge icon="👥" label="Éditeurs" value={stats.uniqueEditors} />
              <StatBadge icon="⚡" label="Édits (30j)" value={stats.recentEdits} />
              <StatBadge icon="↩️" label="Reversions" value={`${stats.reversionRate}%`} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3">
            <span className="text-slate-500 text-sm">Voter pour cet article →</span>
          </div>
        )}
      </div>
    </button>
  )
}

function StatBadge({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

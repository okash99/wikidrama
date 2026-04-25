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
      disabled={revealed}
      className={`w-full text-left rounded-2xl border transition-all overflow-hidden
        ${ revealed ? 'cursor-default' : 'active:scale-95 hover:border-slate-500' }
        ${
          winner && revealed
            ? 'border-yellow-400 bg-slate-800 shadow-lg shadow-yellow-400/10'
            : selected && !winner
            ? 'border-slate-600 bg-slate-900 opacity-60'
            : 'border-slate-700 bg-slate-900'
        }
      `}
    >
      {/* Thumbnail */}
      {article.thumbnail ? (
        <div className="w-full h-36 overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-16 bg-slate-800 flex items-center justify-center">
          <span className="text-3xl opacity-30">📝</span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Winner badge */}
        {winner && revealed && (
          <span className="self-start text-xs font-bold bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full">
            🏆 Plus drama
          </span>
        )}

        {/* Title */}
        <h2 className="font-bold text-lg leading-tight">
          {article.title}
        </h2>

        {/* Extract */}
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
          {article.extract || 'Aucun extrait disponible.'}
        </p>

        {/* Pre-reveal CTA */}
        {!revealed && (
          <div className="flex items-center justify-center py-2 rounded-xl border border-slate-700 border-dashed">
            <span className="text-slate-500 text-sm">👆 Voter pour celui-ci</span>
          </div>
        )}

        {/* Post-reveal stats */}
        {revealed && (
          <div className="flex flex-col gap-2 fade-in">
            {/* Score */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Drama Score</span>
              <span className={`font-extrabold text-2xl ${colorText}`}>{score}%</span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-2 rounded-full fill-bar ${colorBar}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <p className={`text-sm font-semibold ${colorText}`}>{getDramaLabel(score)}</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <StatBadge icon="✏️" label="Éditions totales" value={stats.editCount} />
              <StatBadge icon="👥" label="Éditeurs uniques" value={stats.uniqueEditors} />
              <StatBadge icon="⚡" label="Édits (30 jours)" value={stats.recentEdits} />
              <StatBadge icon="↩️" label="Taux reversion" value={`${stats.reversionRate}%`} />
            </div>
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
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

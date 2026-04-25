import { useState } from 'react'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaLabel } from '../utils/dramaScore'

interface Props {
  articles: [ArticleData, ArticleData]
  winner: 0 | 1
  selected: 0 | 1 | null
}

function dramaBar(score: number): string {
  const filled = Math.round(score / 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  return bar
}

export default function ShareButton({ articles, winner, selected }: Props) {
  const [copied, setCopied] = useState(false)

  const [a, b] = articles
  const scoreA = computeDramaScore(a.stats)
  const scoreB = computeDramaScore(b.stats)
  const winnerData = articles[winner]
  const loserData = articles[winner === 0 ? 1 : 0]
  const winnerScore = winner === 0 ? scoreA : scoreB
  const loserScore = winner === 0 ? scoreB : scoreA

  const guessedRight = selected === winner

  const shareText = [
    '⚔️ WikiDrama — Duel Wikipedia',
    '',
    `🏆 ${winnerData.article.title}`,
    `   ${dramaBar(winnerScore)} ${winnerScore}%`,
    `   ✏️ ${winnerData.stats.editCount} éditions  👥 ${winnerData.stats.uniqueEditors} éditeurs`,
    `   ↩️ ${winnerData.stats.reversionRate}% reversions  ⚡ ${winnerData.stats.recentEdits} édits/30j`,
    `   → ${getDramaLabel(winnerScore)}`,
    '',
    `😤 ${loserData.article.title}`,
    `   ${dramaBar(loserScore)} ${loserScore}%`,
    `   ✏️ ${loserData.stats.editCount} éditions  👥 ${loserData.stats.uniqueEditors} éditeurs`,
    `   ↩️ ${loserData.stats.reversionRate}% reversions  ⚡ ${loserData.stats.recentEdits} édits/30j`,
    `   → ${getDramaLabel(loserScore)}`,
    '',
    guessedRight ? '✅ J\'avais le bon flair !' : '❌ Je me suis fait avoir...',
    '',
    '👉 Tente ta chance sur WikiDrama',
    `https://wikidrama.pages.dev`,
  ].join('\n')

  async function handleShare() {
    // Web Share API (mobile natif)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WikiDrama — Duel Wikipedia',
          text: shareText,
        })
        return
      } catch {
        // user cancelled — silent
      }
    }

    // Fallback clipboard (desktop)
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard blocked — show alert
      alert(shareText)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Preview */}
      <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Aperçu du partage</p>
        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
          {shareText}
        </pre>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-bold text-base flex items-center justify-center gap-2"
      >
        {copied ? (
          <><span>✅</span> Copié dans le presse-papier !</>
        ) : (
          <><span>📤</span> Partager ce duel</>
        )}
      </button>
    </div>
  )
}

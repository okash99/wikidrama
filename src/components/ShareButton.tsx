import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaLabel } from '../utils/dramaScore'

interface Props {
  articles: [ArticleData, ArticleData]
  winner: 0 | 1
  selected: 0 | 1 | null
}

function dramaBar(score: number): string {
  const filled = Math.round(score / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function ShareButton({ articles, winner, selected }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Bloque le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

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
    guessedRight ? "\u2705 J'avais le bon flair !" : "\u274c Je me suis fait avoir...",
    '',
    '👉 Tente ta chance sur WikiDrama',
    'https://wikidrama.pages.dev',
  ].join('\n')

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => { setCopied(false); setShowModal(false) }, 2000)
    } catch { alert(shareText) }
  }

  function shareToWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
    setShowModal(false)
  }

  function shareToTwitter() {
    const shortText = [
      '⚔️ WikiDrama',
      `🏆 ${winnerData.article.title} — ${winnerScore}%`,
      `😤 ${loserData.article.title} — ${loserScore}%`,
      guessedRight ? "\u2705 Je l'avais senti !" : "\u274c Je me suis fait avoir...",
      'https://wikidrama.pages.dev',
    ].join('\n')
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}`, '_blank')
    setShowModal(false)
  }

  async function shareNative() {
    try {
      await navigator.share({ title: 'WikiDrama', text: shareText })
      setShowModal(false)
    } catch { /* cancelled */ }
  }

  const modal = showModal ? (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl p-5 flex flex-col gap-4 slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto" />
        <p className="text-sm font-semibold text-slate-300 text-center">Partager le duel</p>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 max-h-44 overflow-y-auto scrollbar-none">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{shareText}</pre>
        </div>

        <div className="flex flex-col gap-2">
          {canShare && (
            <button onClick={shareNative}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              📱 Partager via...
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={shareToWhatsApp}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              💬 WhatsApp
            </button>
            <button onClick={shareToTwitter}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              🐦 Twitter
            </button>
          </div>
          <button onClick={copyToClipboard}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            {copied ? '✅ Copié !' : '📋 Copier le texte'}
          </button>
        </div>

        <button onClick={() => setShowModal(false)} className="text-slate-500 text-sm text-center py-1">
          Annuler
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-bold text-sm flex items-center justify-center gap-1.5"
      >
        <span>📤</span> Partager
      </button>

      {/* Portal → rendu directement dans document.body, hors de tout overflow-hidden */}
      {createPortal(modal, document.body)}
    </>
  )
}

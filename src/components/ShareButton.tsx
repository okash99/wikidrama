import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaLabel } from '../utils/dramaScore'
import type { WinnerState } from '../pages/Duel'

interface Props {
  articles: [ArticleData, ArticleData]
  winner: WinnerState
  selected: 0 | 1 | null
}

function dramaBar(score: number): string {
  const filled = Math.round(score / 10)
  return '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled)
}

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function ShareButton({ articles, winner, selected }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

  const [a, b] = articles
  const scoreA = computeDramaScore(a.stats)
  const scoreB = computeDramaScore(b.stats)

  const isTie = winner === 'tie'

  // En cas d'égalité : article A comme "winner" par convention d'affichage
  const winnerIdx: 0 | 1 = isTie ? 0 : winner
  const loserIdx: 0 | 1 = winnerIdx === 0 ? 1 : 0

  const winnerData  = articles[winnerIdx]
  const loserData   = articles[loserIdx]
  const winnerScore = winnerIdx === 0 ? scoreA : scoreB
  const loserScore  = winnerIdx === 0 ? scoreB : scoreA
  const guessedRight = isTie || selected === winner

  const tieHeader = isTie ? '\u2696\ufe0f WikiDrama — \u00c9galit\u00e9 !' : '\u2694\ufe0f WikiDrama — Duel Wikipedia'

  const shareText = [
    tieHeader,
    '',
    isTie
      ? `\u2696\ufe0f ${winnerData.article.title} = ${loserData.article.title}`
      : `\ud83c\udfc6 ${winnerData.article.title}`,
    isTie
      ? `   Les deux \u00e0 ${winnerScore}% — aussi drama l'un que l'autre`
      : `   ${dramaBar(winnerScore)} ${winnerScore}%`,
    ...(!isTie ? [
      `   \u270f\ufe0f ${winnerData.stats.editCount} \u00e9ditions  \ud83d\udc65 ${winnerData.stats.uniqueEditors} \u00e9diteurs`,
      `   \u21a9\ufe0f ${winnerData.stats.reversionRate}% reversions  \u26a1 ${winnerData.stats.recentEdits} \u00e9dits/30j`,
      `   \u2192 ${getDramaLabel(winnerScore)}`,
      '',
      `\ud83d\ude24 ${loserData.article.title}`,
      `   ${dramaBar(loserScore)} ${loserScore}%`,
      `   \u270f\ufe0f ${loserData.stats.editCount} \u00e9ditions  \ud83d\udc65 ${loserData.stats.uniqueEditors} \u00e9diteurs`,
      `   \u21a9\ufe0f ${loserData.stats.reversionRate}% reversions  \u26a1 ${loserData.stats.recentEdits} \u00e9dits/30j`,
      `   \u2192 ${getDramaLabel(loserScore)}`,
    ] : []),
    '',
    guessedRight ? "\u2705 J'avais le bon flair !" : "\u274c Je me suis fait avoir...",
    '',
    '\ud83d\udc49 Tente ta chance sur WikiDrama',
    'https://wikidrama.pages.dev',
  ].join('\n')

  const shortTweetText = isTie
    ? [
        '\u2694\ufe0f WikiDrama',
        `\u2696\ufe0f \u00c9galit\u00e9 ! ${winnerData.article.title} vs ${loserData.article.title} — ${winnerScore}% chacun`,
        "\u2705 Aucun gagnant, les deux sont legendaires",
        'https://wikidrama.pages.dev',
      ].join('\n')
    : [
        '\u2694\ufe0f WikiDrama',
        `\ud83c\udfc6 ${winnerData.article.title} — ${winnerScore}%`,
        `\ud83d\ude24 ${loserData.article.title} — ${loserScore}%`,
        guessedRight ? "\u2705 Je l'avais senti !" : "\u274c Je me suis fait avoir...",
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
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortTweetText)}`, '_blank')
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
              &#x1F4F1; Partager via...
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={shareToWhatsApp}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              &#x1F4AC; WhatsApp
            </button>
            <button onClick={shareToTwitter}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              &#x1F426; Twitter
            </button>
          </div>
          <button onClick={copyToClipboard}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            {copied ? '\u2705 Copi\u00e9 !' : '\ud83d\udccb Copier le texte'}
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
        <span>&#x1F4E4;</span> Partager
      </button>

      {createPortal(modal, document.body)}
    </>
  )
}

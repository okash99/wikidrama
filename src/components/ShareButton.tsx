import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaLabel } from '../utils/dramaScore'
import { E } from '../utils/emojis'
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
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden'
    else           document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

  const [a, b]  = articles
  const scoreA  = computeDramaScore(a.stats)
  const scoreB  = computeDramaScore(b.stats)
  const isTie   = winner === 'tie'

  const winnerIdx: 0 | 1  = isTie ? 0 : winner
  const loserIdx:  0 | 1  = winnerIdx === 0 ? 1 : 0
  const winnerData         = articles[winnerIdx]
  const loserData          = articles[loserIdx]
  const winnerScore        = winnerIdx === 0 ? scoreA : scoreB
  const loserScore         = winnerIdx === 0 ? scoreB : scoreA
  const guessedRight       = isTie || selected === winner

  const tieHeader = isTie
    ? `${E.scales} ${E.shareTieHeader}`
    : `${E.swords} ${E.shareDuelHeader}`

  const shareText = [
    tieHeader,
    '',
    isTie
      ? `${E.scales} ${winnerData.article.title} = ${loserData.article.title}`
      : `${E.winner} ${winnerData.article.title}`,
    isTie
      ? `   ${E.shareTieBoth.replace('%score%', String(winnerScore))}`
      : `   ${dramaBar(winnerScore)} ${winnerScore}%`,
    ...(!isTie ? [
      `   ${E.edit} ${winnerData.stats.editCount} ${E.shareEditions}  ${E.editors} ${winnerData.stats.uniqueEditors} ${E.shareEditeurs}`,
      `   ${E.revert} ${winnerData.stats.reversionRate}% reversions  ${winnerData.stats.recentEdits} ${E.shareEdits30}`,
      `   -> ${getDramaLabel(winnerScore)}`,
      '',
      `${E.disputed} ${loserData.article.title}`,
      `   ${dramaBar(loserScore)} ${loserScore}%`,
      `   ${E.edit} ${loserData.stats.editCount} ${E.shareEditions}  ${E.editors} ${loserData.stats.uniqueEditors} ${E.shareEditeurs}`,
      `   ${E.revert} ${loserData.stats.reversionRate}% reversions  ${loserData.stats.recentEdits} ${E.shareEdits30}`,
      `   -> ${getDramaLabel(loserScore)}`,
    ] : []),
    '',
    guessedRight ? `${E.checkmark} ${E.shareRight}` : `${E.cross} ${E.shareWrong}`,
    '',
    `${E.pointRight} Tente ta chance sur WikiDrama`,
    'https://wikidrama.pages.dev',
  ].join('\n')

  const shortTweetText = isTie
    ? [
        `${E.swords} WikiDrama`,
        `${E.scales} ${E.shareTieHeader} ${winnerData.article.title} vs ${loserData.article.title} — ${winnerScore}% chacun`,
        `${E.checkmark} ${E.shareNoWinner}`,
        'https://wikidrama.pages.dev',
      ].join('\n')
    : [
        `${E.swords} WikiDrama`,
        `${E.winner} ${winnerData.article.title} — ${winnerScore}%`,
        `${E.disputed} ${loserData.article.title} — ${loserScore}%`,
        guessedRight ? `${E.checkmark} ${E.shareFelt}` : `${E.cross} ${E.shareWrong}`,
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
        <p className="text-sm font-semibold text-slate-300 text-center">{E.sharePartager}</p>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 max-h-44 overflow-y-auto scrollbar-none">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{shareText}</pre>
        </div>

        <div className="flex flex-col gap-2">
          {canShare && (
            <button onClick={shareNative}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.phone} Partager via...
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={shareToWhatsApp}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.whatsapp} WhatsApp
            </button>
            <button onClick={shareToTwitter}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              {E.twitter} Twitter
            </button>
          </div>
          <button onClick={copyToClipboard}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            {copied ? `${E.checkmark} ${E.shareCopied}` : `${E.clipboard} Copier le texte`}
          </button>
        </div>

        <button onClick={() => setShowModal(false)} className="text-slate-500 text-sm text-center py-1">
          {E.shareAnnuler}
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
        Partager
      </button>
      {createPortal(modal, document.body)}
    </>
  )
}

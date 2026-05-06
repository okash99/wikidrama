import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { ArticleData } from '../api/wikipedia'
import { computeDramaScore, getDramaTierKey } from '../utils/dramaScore'
import type { WinnerState } from '../pages/Duel'
import { useFocusTrap } from '../hooks/useFocusTrap'
import Icon from './Icon'
import { useProfile } from '../context/ProfileContext'

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
  const { t } = useTranslation()
  const { addQuestEvent } = useProfile()
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const modalRef = useFocusTrap(showModal, () => setShowModal(false))

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

  const langA = a.article.url.split('//')[1]?.split('.')[0] || 'en'
  const langB = b.article.url.split('//')[1]?.split('.')[0] || 'en'
  const shareUrl = `${window.location.origin}/duel?a=${langA}:${encodeURIComponent(a.article.title)}&b=${langB}:${encodeURIComponent(b.article.title)}`

  const shareText = [
    isTie ? t('shareTieHeader') : t('shareDuelHeader'),
    '',
    isTie
      ? `${winnerData.article.title} = ${loserData.article.title}`
      : `Winner: ${winnerData.article.title}`,
    isTie
      ? `   ${t('shareTieBoth').replace('%score%', String(winnerScore))}`
      : `   ${dramaBar(winnerScore)} ${winnerScore}%`,
    ...(!isTie ? [
      `   ${winnerData.stats.editCount} ${t('shareEditions')}  ${winnerData.stats.uniqueEditors} ${t('shareEditeurs')}`,
      `   ${winnerData.stats.reversionRate}% reversions  ${winnerData.stats.recentEdits} ${t('shareEdits30')}`,
      `   -> ${t(getDramaTierKey(winnerScore))}`,
      '',
      `Challenger: ${loserData.article.title}`,
      `   ${dramaBar(loserScore)} ${loserScore}%`,
      `   ${loserData.stats.editCount} ${t('shareEditions')}  ${loserData.stats.uniqueEditors} ${t('shareEditeurs')}`,
      `   ${loserData.stats.reversionRate}% reversions  ${loserData.stats.recentEdits} ${t('shareEdits30')}`,
      `   -> ${t(getDramaTierKey(loserScore))}`,
    ] : []),
    '',
    guessedRight ? t('shareRight') : t('shareWrong'),
    '',
    t('shareTryIt'),
    shareUrl,
  ].join('\n')

  const shortTweetText = isTie
    ? [
        'WikiDrama',
        `${t('shareTieHeader')} ${winnerData.article.title} vs ${loserData.article.title} - ${winnerScore}% chacun`,
        t('shareNoWinner'),
        shareUrl,
      ].join('\n')
    : [
        'WikiDrama',
        `${winnerData.article.title} - ${winnerScore}%`,
        `${loserData.article.title} - ${loserScore}%`,
        guessedRight ? t('shareFelt') : t('shareWrong'),
        shareUrl,
      ].join('\n')

  function recordShareQuest() {
    addQuestEvent({ type: 'SHARE_DUEL' })
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText)
      recordShareQuest()
      setCopied(true)
      setTimeout(() => { setCopied(false); setShowModal(false) }, 2000)
    } catch { alert(shareText) }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      recordShareQuest()
      setLinkCopied(true)
      setTimeout(() => { setLinkCopied(false); setShowModal(false) }, 2000)
    } catch { alert(shareUrl) }
  }

  function shareToWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
    recordShareQuest()
    setShowModal(false)
  }

  function shareToTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortTweetText)}`, '_blank')
    recordShareQuest()
    setShowModal(false)
  }

  async function shareNative() {
    try {
      await navigator.share({ title: 'WikiDrama', text: shareText })
      recordShareQuest()
      setShowModal(false)
    } catch { /* cancelled */ }
  }

  const modal = showModal ? (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="w-full max-w-md bg-panel/50 backdrop-blur-2xl border border-border-strong rounded-t-3xl p-5 flex flex-col gap-4 slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border-strong rounded-full mx-auto" />
        <p id="share-title" className="text-sm font-semibold text-text text-center">{t('sharePartager')}</p>

        <div className="bg-card/40 backdrop-blur-lg border border-border-strong rounded-2xl p-4 max-h-44 overflow-y-auto scrollbar-none">
          <pre className="text-xs text-text whitespace-pre-wrap font-mono leading-relaxed">{shareText}</pre>
        </div>

        <div className="flex flex-col gap-2">
          {canShare && (
            <button onClick={shareNative}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="phone" className="h-4 w-4" />
              {t('shareVia')}
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={shareToWhatsApp}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="whatsapp" className="h-4 w-4" />
              WhatsApp
            </button>
            <button onClick={shareToTwitter}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name="twitter" className="h-4 w-4" />
              Twitter
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={copyToClipboard}
              className="flex-1 py-3 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name={copied ? 'check' : 'clipboard'} className="h-4 w-4" />
              {copied ? t('shareCopied') : t('copyText')}
            </button>
            <button onClick={copyLink}
              className="flex-1 py-3 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-semibold text-sm flex items-center justify-center gap-2">
              <Icon name={linkCopied ? 'check' : 'link'} className="h-4 w-4" />
              {linkCopied ? t('shareCopied') : t('copyLink')}
            </button>
          </div>
        </div>

        <button onClick={() => setShowModal(false)} className="text-muted text-sm text-center py-1">
          {t('shareAnnuler')}
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 py-2.5 rounded-xl bg-btn hover:bg-btn-hover active:scale-95 transition-all font-bold text-sm flex items-center justify-center gap-1.5"
      >
        {t('share')}
      </button>
      {createPortal(modal, document.body)}
    </>
  )
}

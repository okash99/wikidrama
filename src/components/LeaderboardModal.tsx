import { useTranslation } from 'react-i18next'
import Icon from './Icon'
import { useProfile } from '../context/ProfileContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { createLeaderboardEntry } from '../types/profile'

interface LeaderboardModalProps {
  onClose: () => void
}

function CloseIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 text-red-300 transition-colors group-hover:border-red-300/40 group-hover:bg-red-500/15 group-hover:text-red-200">
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  )
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const { t } = useTranslation()
  const { profile } = useProfile()
  const modalRef = useFocusTrap(true, onClose)

  const localEntry = createLeaderboardEntry(profile)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
        className="relative w-full mx-4 max-w-sm rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 flex flex-col gap-5 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="leaderboard-title" className="flex items-center gap-2 text-white font-bold text-base">
            <Icon name="trophy" className="h-4 w-4 text-yellow-300" />
            {t('leaderboard')}
          </h2>
          <button
            onClick={onClose}
            className="group flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-300/25 bg-black/30 text-yellow-300">
            <Icon name="trophy" className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-yellow-100">{t('leaderboardLockedTitle')}</p>
          <p className="mt-1 text-xs leading-relaxed text-yellow-100/70">
            {t('leaderboardLockedDesc')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-1">{t('leaderboardLocalStats')}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="inline-flex items-center gap-1 text-2xl font-black text-yellow-400">
                {localEntry.bestStreak}
                <Icon name="flame" className="h-6 w-6 text-yellow-400/60" />
              </span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('profileBestStreak')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-blue-400">{localEntry.level}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('leaderboardLevel')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-zinc-200">{localEntry.totalXpEarned}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('leaderboardTotalXp')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-green-400">{localEntry.gamesPlayed}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('leaderboardGames')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

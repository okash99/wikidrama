import { useTranslation } from 'react-i18next'
import { useProfile } from '../context/ProfileContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getTitleKeyForLevel, XP_PER_LEVEL, Quest } from '../types/profile'

interface ProfileModalProps {
  onClose: () => void
}

function UserIcon() {
  return (
    <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
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

function QuestItem({ quest }: { quest: Quest }) {
  const { t } = useTranslation()
  const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100))
  
  let label = t(`quest.type.${quest.type}`, { target: quest.target, category: quest.categoryTarget })

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl relative overflow-hidden">
      {quest.completed && (
        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-end pr-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
      <div className="flex justify-between items-center z-10">
        <span className={`text-sm font-medium ${quest.completed ? 'text-zinc-400' : 'text-zinc-200'}`}>
          {label}
        </span>
        <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
          +{quest.xpReward} XP
        </span>
      </div>
      <div className="z-10 flex items-center gap-3">
        <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${quest.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400 font-mono w-8 text-right">
          {quest.progress}/{quest.target}
        </span>
      </div>
    </div>
  )
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { t } = useTranslation()
  const { profile } = useProfile()
  const modalRef = useFocusTrap(true, onClose)

  const { level, xp } = profile.progression
  const titleKey = getTitleKeyForLevel(level)
  const xpPercent = Math.min(100, (xp / XP_PER_LEVEL) * 100)

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
        aria-labelledby="profile-title"
        className="relative w-full mx-4 max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 flex flex-col gap-6 p-5 shadow-2xl custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="profile-title" className="flex items-center gap-2 text-white font-bold text-base">
            {t('profile')}
          </h2>
          <button
            onClick={onClose}
            className="group flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <CloseIcon />
          </button>
        </div>

        {/* User Header */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center relative shadow-inner">
            <UserIcon />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border border-blue-400 shadow-md">
              LVL {level}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-lg leading-tight">{t(titleKey)}</h3>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mt-1">{t('profileLevel', { level })}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex flex-col gap-1.5 px-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-blue-400">XP</span>
            <span className="text-zinc-400">{t('profileXp', { xp, req: XP_PER_LEVEL })}</span>
          </div>
          <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${xpPercent}%` }}
            >
              <div className="absolute top-0 bottom-0 right-0 w-4 bg-white/20 blur-[2px]" />
            </div>
          </div>
        </div>

        {/* Daily Quests */}
        <div className="flex flex-col gap-3">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-1">{t('profileDailyQuests')}</p>
          <div className="flex flex-col gap-2">
            {profile.dailyQuests.map(quest => (
              <QuestItem key={quest.id} quest={quest} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-1">{t('profileStats')}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-green-400">{profile.stats.wins}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('profileWins')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-red-400">{profile.stats.losses}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('profileLosses')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-zinc-300">{profile.stats.draws}</span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('profileDraws')}</span>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-yellow-400">{profile.stats.bestStreak} 
                <span className="text-yellow-400/50 text-sm ml-0.5">🔥</span>
              </span>
              <span className="text-xs text-zinc-500 font-medium uppercase mt-1">{t('profileBestStreak')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

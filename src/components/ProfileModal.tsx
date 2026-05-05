import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../context/ProfileContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getTitleKeyForLevel, getXpForLevel, Quest } from '../types/profile'
import { AVATARS } from '../constants/avatars'

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
  const { profile, updateAvatar } = useProfile()
  const modalRef = useFocusTrap(true, onClose)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)

  const { level, xp } = profile.progression
  const selectedAvatar = AVATARS.find(a => a.id === profile.avatarId)
  const titleKey = getTitleKeyForLevel(level)
  const xpRequired = getXpForLevel(level)
  const xpPercent = level >= 100 ? 100 : Math.min(100, (xp / xpRequired) * 100)

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

        {!isEditingAvatar ? (
          <>
            {/* User Header */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <div className="relative group cursor-pointer" onClick={() => setIsEditingAvatar(true)}>
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-inner overflow-hidden transition-all duration-300 ${selectedAvatar ? `${selectedAvatar.bg} ${selectedAvatar.border}` : 'bg-zinc-800 border-zinc-700'}`}>
                  {selectedAvatar ? (
                    <div className={`w-11 h-11 ${selectedAvatar.color}`}>{selectedAvatar.icon}</div>
                  ) : (
                    <UserIcon />
                  )}
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border border-blue-400 shadow-md z-10 pointer-events-none">
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
                <span className="text-zinc-400">{t('profileXp', { xp, req: xpRequired })}</span>
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
          </>
        ) : (
          <div className="flex flex-col gap-4 pb-2 fade-in">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setIsEditingAvatar(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                {t('back')}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((avatar) => {
                const isSelected = profile.avatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      updateAvatar(avatar.id);
                      setIsEditingAvatar(false);
                    }}
                    className={`group relative flex items-center justify-center aspect-square rounded-xl border transition-all duration-300 overflow-hidden 
                      ${isSelected ? 'bg-zinc-800/80 border-zinc-500 shadow-md scale-105' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'}
                      ${avatar.glow}
                    `}
                  >
                    {/* Background glow base */}
                    <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${isSelected ? 'opacity-40' : 'group-hover:opacity-30'} ${avatar.bg}`}></div>
                    
                    {/* Icon */}
                    <div className={`w-10 h-10 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'} ${avatar.color}`}>
                      {avatar.icon}
                    </div>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] border border-white/20"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

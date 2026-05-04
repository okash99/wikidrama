import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PlayerProfile, Quest, XP_PER_LEVEL } from '../types/profile';
import { loadProfile, saveProfile } from '../utils/storage';

interface GameResult {
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  mode: string; // 'classic', 'wikiwars', 'sudden_death', etc.
  category?: string; // e.g. 'Politics', 'Pop Culture'
}

interface ProfileContextType {
  profile: PlayerProfile;
  addGameResult: (result: GameResult) => void;
  xpGainedNotification: number | null;
  clearXpNotification: () => void;
  updateAvatar: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [xpGainedNotification, setXpGainedNotification] = useState<number | null>(null);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const addXp = useCallback((amount: number, currentProfile: PlayerProfile): PlayerProfile => {
    let newXp = currentProfile.progression.xp + amount;
    let newLevel = currentProfile.progression.level;

    // Level up logic (Max Level 100)
    while (newXp >= XP_PER_LEVEL && newLevel < 100) {
      newXp -= XP_PER_LEVEL;
      newLevel += 1;
    }
    
    // If level 100, cap XP
    if (newLevel >= 100) {
      newLevel = 100;
      newXp = XP_PER_LEVEL;
    }

    return {
      ...currentProfile,
      progression: {
        level: newLevel,
        xp: newXp
      }
    };
  }, []);

  const updateQuests = useCallback((quests: Quest[], result: GameResult, isWin: boolean, streak: number): { quests: Quest[], totalXpReward: number } => {
    let totalXpReward = 0;
    const updatedQuests = quests.map(quest => {
      if (quest.completed) return quest;

      let progressToAdd = 0;

      switch (quest.type) {
        case 'PLAY_ANY':
          progressToAdd = 1;
          break;
        case 'WIN_ANY':
          if (isWin) progressToAdd = 1;
          break;
        case 'WIN_WIKIWARS':
          if (isWin && result.mode === 'wikiwars') progressToAdd = 1;
          break;
        case 'PLAY_SUDDEN_DEATH':
          if (result.mode === 'sudden_death') progressToAdd = 1;
          break;
        case 'STREAK':
          // For streak, progress is the max streak reached
          if (streak > quest.progress) {
            progressToAdd = streak - quest.progress;
          }
          break;
        case 'PLAY_CATEGORY':
          if (result.category === quest.categoryTarget) progressToAdd = 1;
          break;
      }

      const newProgress = Math.min(quest.progress + progressToAdd, quest.target);
      const isCompleted = newProgress >= quest.target;

      if (isCompleted && !quest.completed) {
        totalXpReward += quest.xpReward;
      }

      return {
        ...quest,
        progress: newProgress,
        completed: isCompleted
      };
    });

    return { quests: updatedQuests, totalXpReward };
  }, []);

  const addGameResult = useCallback((result: GameResult) => {
    setProfile(prev => {
      const isWin = result.outcome === 'WIN';
      const isDraw = result.outcome === 'DRAW';
      
      const newWins = isWin ? prev.stats.wins + 1 : prev.stats.wins;
      const newLosses = result.outcome === 'LOSS' ? prev.stats.losses + 1 : prev.stats.losses;
      const newDraws = isDraw ? prev.stats.draws + 1 : prev.stats.draws;
      
      const newStreak = isWin ? prev.stats.currentStreak + 1 : 0;
      const newBestStreak = Math.max(prev.stats.bestStreak, newStreak);
      
      const newGamesPlayed = { ...prev.stats.gamesPlayedPerMode };
      newGamesPlayed[result.mode] = (newGamesPlayed[result.mode] || 0) + 1;

      // Base XP
      let xpEarned = 0;
      if (isWin) xpEarned += 10;
      if (isDraw) xpEarned += 5;
      
      // Streak Bonus
      if (isWin && newStreak > 1) {
        xpEarned += newStreak;
      }

      // Update Quests
      const { quests: newQuests, totalXpReward: questXp } = updateQuests(prev.dailyQuests, result, isWin, newStreak);
      xpEarned += questXp;

      let nextProfile = {
        ...prev,
        stats: {
          wins: newWins,
          losses: newLosses,
          draws: newDraws,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          gamesPlayedPerMode: newGamesPlayed
        },
        dailyQuests: newQuests
      };

      if (xpEarned > 0) {
        nextProfile = addXp(xpEarned, nextProfile);
        setXpGainedNotification(xpEarned);
      }

      return nextProfile;
    });
  }, [addXp, updateQuests]);

  const clearXpNotification = useCallback(() => {
    setXpGainedNotification(null);
  }, []);

  const updateAvatar = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      avatarId: id
    }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, addGameResult, xpGainedNotification, clearXpNotification, updateAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

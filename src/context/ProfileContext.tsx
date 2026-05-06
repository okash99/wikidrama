import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DailyQuestState, PlayerProfile, Quest, getXpForLevel } from '../types/profile';
import { loadProfile, saveProfile } from '../utils/storage';
import { getCategoryId } from '../data/categories';

interface GameResult {
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  mode: string; // 'random', 'thematic', 'wikiwars', etc.
  category?: string; // e.g. 'Politics', 'Pop Culture'
  suddenDeath?: boolean;
  protectedArticles?: number;
  legendaryArticles?: number;
}

interface QuestEvent {
  type: 'SHARE_DUEL';
}

interface ProfileContextType {
  profile: PlayerProfile;
  addGameResult: (result: GameResult) => void;
  addQuestEvent: (event: QuestEvent) => void;
  xpGainedNotification: number | null;
  clearXpNotification: () => void;
  updateAvatar: (id: string) => void;
  updateAvatarBg: (themeId: string | undefined) => void;
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

    // Level up logic (Max Level 100) — exponential curve
    while (newLevel < 100) {
      const required = getXpForLevel(newLevel);
      if (newXp >= required) {
        newXp -= required;
        newLevel += 1;
      } else {
        break;
      }
    }

    // If level 100, cap XP (bar shows full)
    if (newLevel >= 100) {
      newLevel = 100;
      newXp = 0;
    }

    return {
      ...currentProfile,
      progression: {
        level: newLevel,
        xp: newXp,
        totalXpEarned: currentProfile.progression.totalXpEarned + amount
      }
    };
  }, []);

  const updateQuests = useCallback((
    quests: Quest[],
    result: GameResult,
    isWin: boolean,
    streak: number,
    questState: DailyQuestState
  ): { quests: Quest[], totalXpReward: number } => {
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
        case 'WIN_WIKIWARS_STREAK':
          if (result.mode === 'wikiwars' && questState.wikiWarsStreak > quest.progress) {
            progressToAdd = questState.wikiWarsStreak - quest.progress;
          }
          break;
        case 'PLAY_SUDDEN_DEATH':
          if (result.suddenDeath) progressToAdd = 1;
          break;
        case 'WIN_SUDDEN_DEATH':
          if (isWin && result.suddenDeath) progressToAdd = 1;
          break;
        case 'STREAK':
          // For streak, progress is the max streak reached
          if (streak > quest.progress) {
            progressToAdd = streak - quest.progress;
          }
          break;
        case 'PLAY_CATEGORY':
          if (getCategoryId(result.category) === getCategoryId(quest.categoryTarget)) progressToAdd = 1;
          break;
        case 'PLAY_DISTINCT_CATEGORIES':
          if (questState.categoriesPlayed.length > quest.progress) {
            progressToAdd = questState.categoriesPlayed.length - quest.progress;
          }
          break;
        case 'ENCOUNTER_PROTECTED':
          if ((result.protectedArticles ?? 0) >= 1) progressToAdd = 1;
          break;
        case 'ENCOUNTER_DOUBLE_PROTECTED':
          if ((result.protectedArticles ?? 0) >= 2) progressToAdd = 1;
          break;
        case 'DRAW_ANY':
          if (result.outcome === 'DRAW') progressToAdd = 1;
          break;
        case 'WIN_THEMATIC':
          if (isWin && result.mode === 'thematic') progressToAdd = 1;
          break;
        case 'DUEL_LEGENDS':
          if ((result.legendaryArticles ?? 0) >= 2) progressToAdd = 1;
          break;
        case 'SHARE_DUEL':
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

  const updateQuestsForEvent = useCallback((quests: Quest[], event: QuestEvent): { quests: Quest[], totalXpReward: number } => {
    let totalXpReward = 0;
    const updatedQuests = quests.map(quest => {
      if (quest.completed) return quest;

      const progressToAdd = quest.type === event.type ? 1 : 0;
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
      const categoryId = getCategoryId(result.category);
      const newCategoriesPlayed = categoryId && !prev.dailyQuestState.categoriesPlayed.includes(categoryId)
        ? [...prev.dailyQuestState.categoriesPlayed, categoryId]
        : prev.dailyQuestState.categoriesPlayed;
      const newWikiWarsStreak = result.mode === 'wikiwars'
        ? (isWin ? prev.dailyQuestState.wikiWarsStreak + 1 : 0)
        : prev.dailyQuestState.wikiWarsStreak;
      const newDailyQuestState = {
        categoriesPlayed: newCategoriesPlayed,
        wikiWarsStreak: newWikiWarsStreak
      };

      // Base XP
      let xpEarned = 0;
      if (isWin) xpEarned += 10;
      if (isDraw) xpEarned += 5;
      
      // Streak Bonus
      if (isWin && newStreak > 1) {
        xpEarned += newStreak;
      }

      // Sudden Death XP boost
      if (result.suddenDeath) {
        xpEarned *= 2;
      }

      // Update Quests
      const { quests: newQuests, totalXpReward: questXp } = updateQuests(prev.dailyQuests, result, isWin, newStreak, newDailyQuestState);
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
        dailyQuests: newQuests,
        dailyQuestState: newDailyQuestState
      };

      if (xpEarned > 0) {
        nextProfile = addXp(xpEarned, nextProfile);
        setXpGainedNotification(xpEarned);
      }

      return nextProfile;
    });
  }, [addXp, updateQuests]);

  const addQuestEvent = useCallback((event: QuestEvent) => {
    setProfile(prev => {
      const { quests: newQuests, totalXpReward: questXp } = updateQuestsForEvent(prev.dailyQuests, event);
      let nextProfile = {
        ...prev,
        dailyQuests: newQuests
      };

      if (questXp > 0) {
        nextProfile = addXp(questXp, nextProfile);
        setXpGainedNotification(questXp);
      }

      return nextProfile;
    });
  }, [addXp, updateQuestsForEvent]);

  const clearXpNotification = useCallback(() => {
    setXpGainedNotification(null);
  }, []);

  const updateAvatar = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      avatarId: id
    }));
  }, []);

  const updateAvatarBg = useCallback((themeId: string | undefined) => {
    setProfile(prev => ({
      ...prev,
      avatarBgTheme: themeId
    }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, addGameResult, addQuestEvent, xpGainedNotification, clearXpNotification, updateAvatar, updateAvatarBg }}>
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

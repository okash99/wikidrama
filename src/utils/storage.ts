import { PlayerProfile } from '../types/profile';
import { getCurrentDateStr, getDailyQuests } from '../data/quests';

const PROFILE_STORAGE_KEY = 'wikidrama_player_profile';

export const getInitialProfile = (): PlayerProfile => {
  const dateStr = getCurrentDateStr();
  return {
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      bestStreak: 0,
      gamesPlayedPerMode: {}
    },
    progression: {
      level: 1,
      xp: 0
    },
    dailyQuests: getDailyQuests(dateStr),
    lastLoginDate: dateStr
  };
};

export const normalizeProfile = (stored: Partial<PlayerProfile>, initial = getInitialProfile()): PlayerProfile => ({
  ...initial,
  ...stored,
  stats: {
    ...initial.stats,
    ...stored.stats,
    gamesPlayedPerMode: {
      ...initial.stats.gamesPlayedPerMode,
      ...stored.stats?.gamesPlayedPerMode
    }
  },
  progression: {
    ...initial.progression,
    ...stored.progression
  },
  dailyQuests: Array.isArray(stored.dailyQuests) ? stored.dailyQuests : initial.dailyQuests,
  lastLoginDate: stored.lastLoginDate || initial.lastLoginDate
});

export const loadProfile = (): PlayerProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!data) return getInitialProfile();

    const stored = JSON.parse(data) as Partial<PlayerProfile>;
    const profile = normalizeProfile(stored);
    const currentDate = getCurrentDateStr();

    // Check if it's a new day, if so, reset quests and update login date
    if (profile.lastLoginDate !== currentDate) {
      profile.dailyQuests = getDailyQuests(currentDate);
      profile.lastLoginDate = currentDate;
      saveProfile(profile);
    }

    return profile;
  } catch (error) {
    console.error('Failed to load profile from localStorage:', error);
    return getInitialProfile();
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile to localStorage:', error);
  }
};

export const clearProfile = (): void => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear profile from localStorage:', error);
  }
};

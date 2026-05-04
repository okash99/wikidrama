import { Quest } from '../types/profile';

// Seeded random number generator
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BASE_QUESTS: Omit<Quest, 'progress' | 'completed'>[] = [
  // PLAY_ANY
  { id: 'q_play_3', type: 'PLAY_ANY', target: 3, xpReward: 30 },
  { id: 'q_play_5', type: 'PLAY_ANY', target: 5, xpReward: 50 },
  { id: 'q_play_10', type: 'PLAY_ANY', target: 10, xpReward: 100 },
  // WIN_ANY
  { id: 'q_win_1', type: 'WIN_ANY', target: 1, xpReward: 20 },
  { id: 'q_win_3', type: 'WIN_ANY', target: 3, xpReward: 50 },
  { id: 'q_win_5', type: 'WIN_ANY', target: 5, xpReward: 80 },
  // WIN_WIKIWARS
  { id: 'q_win_ww_1', type: 'WIN_WIKIWARS', target: 1, xpReward: 30 },
  { id: 'q_win_ww_3', type: 'WIN_WIKIWARS', target: 3, xpReward: 80 },
  // PLAY_SUDDEN_DEATH
  { id: 'q_play_sd_1', type: 'PLAY_SUDDEN_DEATH', target: 1, xpReward: 40 },
  { id: 'q_play_sd_3', type: 'PLAY_SUDDEN_DEATH', target: 3, xpReward: 80 },
  // STREAK
  { id: 'q_streak_3', type: 'STREAK', target: 3, xpReward: 40 },
  { id: 'q_streak_5', type: 'STREAK', target: 5, xpReward: 80 },
  { id: 'q_streak_10', type: 'STREAK', target: 10, xpReward: 150 },
  // CATEGORIES (Assuming these exist, we just check generic 'PLAY_CATEGORY')
  { id: 'q_cat_politics', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Politics', xpReward: 40 },
  { id: 'q_cat_science', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Science', xpReward: 40 },
  { id: 'q_cat_popculture', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Pop Culture', xpReward: 40 },
  { id: 'q_cat_sport', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Sport', xpReward: 40 },
  { id: 'q_cat_tech', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Tech', xpReward: 40 },
  { id: 'q_cat_history', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'History', xpReward: 40 },
  { id: 'q_cat_religion', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'Religion', xpReward: 40 }
];

/**
 * Returns 3 random quests based on the date string (YYYY-MM-DD).
 * Ensures that all users get the same daily quests for the same day,
 * and that quests remain consistent throughout the day.
 */
export const getDailyQuests = (dateStr: string): Quest[] => {
  // Convert date string to a seed (e.g., '2026-05-04' -> 20260504)
  const seed = parseInt(dateStr.replace(/-/g, ''), 10);
  const random = mulberry32(seed);

  const availableQuests = [...BASE_QUESTS];
  const selectedQuests: Quest[] = [];

  for (let i = 0; i < 3; i++) {
    if (availableQuests.length === 0) break;
    const randomIndex = Math.floor(random() * availableQuests.length);
    const quest = availableQuests[randomIndex];
    
    selectedQuests.push({
      ...quest,
      progress: 0,
      completed: false
    });
    
    availableQuests.splice(randomIndex, 1);
  }

  return selectedQuests;
};

export const getCurrentDateStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

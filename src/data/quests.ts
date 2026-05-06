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
  { id: 'q_play_3', type: 'PLAY_ANY', target: 3, rarity: 'common', xpReward: 30 },
  { id: 'q_play_5', type: 'PLAY_ANY', target: 5, rarity: 'common', xpReward: 50 },
  { id: 'q_play_10', type: 'PLAY_ANY', target: 10, rarity: 'common', xpReward: 100 },
  // WIN_ANY
  { id: 'q_win_1', type: 'WIN_ANY', target: 1, rarity: 'common', xpReward: 20 },
  { id: 'q_win_3', type: 'WIN_ANY', target: 3, rarity: 'common', xpReward: 50 },
  { id: 'q_win_5', type: 'WIN_ANY', target: 5, rarity: 'common', xpReward: 80 },
  // WIN_WIKIWARS
  { id: 'q_win_ww_1', type: 'WIN_WIKIWARS', target: 1, rarity: 'common', xpReward: 30 },
  { id: 'q_win_ww_2', type: 'WIN_WIKIWARS', target: 2, rarity: 'rare', xpReward: 160 },
  { id: 'q_win_ww_3', type: 'WIN_WIKIWARS', target: 3, rarity: 'common', xpReward: 80 },
  { id: 'q_streak_ww_5', type: 'WIN_WIKIWARS_STREAK', target: 5, rarity: 'epic', xpReward: 500 },
  // PLAY_SUDDEN_DEATH
  { id: 'q_play_sd_1', type: 'PLAY_SUDDEN_DEATH', target: 1, rarity: 'common', xpReward: 40 },
  { id: 'q_play_sd_3', type: 'PLAY_SUDDEN_DEATH', target: 3, rarity: 'common', xpReward: 80 },
  { id: 'q_win_sd_1', type: 'WIN_SUDDEN_DEATH', target: 1, rarity: 'common', xpReward: 60 },
  // STREAK
  { id: 'q_streak_3', type: 'STREAK', target: 3, rarity: 'common', xpReward: 40 },
  { id: 'q_streak_5', type: 'STREAK', target: 5, rarity: 'common', xpReward: 80 },
  { id: 'q_streak_7', type: 'STREAK', target: 7, rarity: 'epic', xpReward: 400 },
  { id: 'q_streak_10', type: 'STREAK', target: 10, rarity: 'common', xpReward: 150 },
  // CATEGORIES
  { id: 'q_cat_politics', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'politics', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_science', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'science', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_popculture', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'pop-culture', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_sport', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'sport', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_tech', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'tech', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_history', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'history', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_religion', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'religion', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_youtube_fr', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'youtube-fr', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_youtube_us', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'youtube-us', rarity: 'common', xpReward: 40 },
  { id: 'q_cat_misc', type: 'PLAY_CATEGORY', target: 2, categoryTarget: 'misc', rarity: 'common', xpReward: 40 },
  { id: 'q_distinct_cat_2', type: 'PLAY_DISTINCT_CATEGORIES', target: 2, rarity: 'common', xpReward: 50 },
  { id: 'q_distinct_cat_4', type: 'PLAY_DISTINCT_CATEGORIES', target: 4, rarity: 'rare', xpReward: 180 },
  // SPECIAL DUELS
  { id: 'q_protected_1', type: 'ENCOUNTER_PROTECTED', target: 1, rarity: 'common', xpReward: 40 },
  { id: 'q_double_protected_1', type: 'ENCOUNTER_DOUBLE_PROTECTED', target: 1, rarity: 'common', xpReward: 75 },
  { id: 'q_draw_1', type: 'DRAW_ANY', target: 1, rarity: 'common', xpReward: 40 },
  { id: 'q_share_duel_1', type: 'SHARE_DUEL', target: 1, rarity: 'common', xpReward: 30 },
  { id: 'q_win_thematic_3', type: 'WIN_THEMATIC', target: 3, rarity: 'rare', xpReward: 150 },
  { id: 'q_duel_legends_1', type: 'DUEL_LEGENDS', target: 1, rarity: 'epic', xpReward: 500 }
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

  const pickQuest = (quests: typeof availableQuests) => {
    const randomIndex = Math.floor(random() * quests.length);
    const quest = quests[randomIndex];
    
    selectedQuests.push({
      ...quest,
      progress: 0,
      completed: false
    });
    
    availableQuests.splice(availableQuests.findIndex((candidate) => candidate.id === quest.id), 1);
  };

  for (let i = 0; i < 2; i++) {
    const commonQuests = availableQuests.filter((quest) => (quest.rarity ?? 'common') === 'common');
    if (commonQuests.length === 0) break;
    pickQuest(commonQuests);
  }

  if (availableQuests.length > 0) {
    const roll = random();
    const targetRarity = roll < 0.05 ? 'epic' : roll < 0.25 ? 'rare' : 'common';
    const rarityQuests = availableQuests.filter((quest) => (quest.rarity ?? 'common') === targetRarity);
    pickQuest(rarityQuests.length > 0 ? rarityQuests : availableQuests);
  }

  return selectedQuests;
};

export const getCurrentDateStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

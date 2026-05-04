export interface Quest {
  id: string;
  type: 'PLAY_ANY' | 'WIN_ANY' | 'WIN_WIKIWARS' | 'PLAY_SUDDEN_DEATH' | 'STREAK' | 'PLAY_CATEGORY';
  target: number; // e.g., 3 wins
  categoryTarget?: string; // e.g., 'Pop Culture'
  progress: number;
  completed: boolean;
  xpReward: number;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  gamesPlayedPerMode: Record<string, number>;
}

export interface PlayerProgression {
  level: number;
  xp: number;
}

export interface PlayerProfile {
  stats: PlayerStats;
  progression: PlayerProgression;
  dailyQuests: Quest[];
  lastLoginDate: string; // YYYY-MM-DD
}

export const XP_PER_LEVEL = 100;

export const LEVEL_TITLES = [
  { maxLevel: 9, key: 'profile.titles.novice' },
  { maxLevel: 19, key: 'profile.titles.apprentice' },
  { maxLevel: 29, key: 'profile.titles.explorer' },
  { maxLevel: 39, key: 'profile.titles.hunter' },
  { maxLevel: 49, key: 'profile.titles.expert' },
  { maxLevel: 59, key: 'profile.titles.master' },
  { maxLevel: 69, key: 'profile.titles.historian' },
  { maxLevel: 79, key: 'profile.titles.legend' },
  { maxLevel: 89, key: 'profile.titles.guardian' },
  { maxLevel: 100, key: 'profile.titles.omniscient' }
];

export const getTitleKeyForLevel = (level: number): string => {
  const titleObj = LEVEL_TITLES.find((t) => level <= t.maxLevel);
  return titleObj ? titleObj.key : 'profile.titles.omniscient';
};

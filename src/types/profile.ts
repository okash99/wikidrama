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
  avatarId?: string;
  avatarBgTheme?: string;
  stats: PlayerStats;
  progression: PlayerProgression;
  dailyQuests: Quest[];
  lastLoginDate: string; // YYYY-MM-DD
}

/**
 * Dofus-style accelerated XP curve (base 50).
 * Growth rates: 3% (lvl 1-69) → 6% (70-79) → 8% (80-89) → 15% (90-98).
 * Boss level (99 → 100) = sum of all levels 1 → 98.
 *
 * Key milestones:
 *   Lvl 2: 50 XP  |  Lvl 50: 146  |  Lvl 90: 945
 *   Lvl 99: 3 316  |  Boss: ~36 660  |  Total: ~73 320
 */

function _xpGrowthRate(level: number): number {
  if (level >= 90) return 1.15;
  if (level >= 80) return 1.08;
  if (level >= 70) return 1.06;
  return 1.03;
}

// Pre-computed table (built once at module load)
const _xpTable: number[] = [0]; // index 0 unused
_xpTable[1] = 50;
for (let i = 2; i <= 98; i++) {
  _xpTable[i] = Math.floor(_xpTable[i - 1] * _xpGrowthRate(i));
}
let _bossXp = 0;
for (let i = 1; i <= 98; i++) _bossXp += _xpTable[i];
_xpTable[99] = _bossXp;

export function getXpForLevel(level: number): number {
  if (level >= 100) return 0;
  return _xpTable[level] ?? 0;
}

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

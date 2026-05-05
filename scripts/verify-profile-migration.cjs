const fs = require('fs');
const ts = require('typescript');
const vm = require('vm');

const source = fs.readFileSync('src/utils/storage.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText;

const moduleRef = { exports: {} };
const sandbox = {
  module: moduleRef,
  exports: moduleRef.exports,
  console,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  require(id) {
    if (id === '../data/quests') {
      return {
        getCurrentDateStr: () => '2026-05-06',
        getDailyQuests: () => [
          { id: 'q_play_3', type: 'PLAY_ANY', target: 3, progress: 0, completed: false, xpReward: 30 }
        ]
      };
    }
    throw new Error(`Unexpected import in profile migration check: ${id}`);
  }
};

sandbox.exports = moduleRef.exports;
vm.runInNewContext(js, sandbox);

const { normalizeProfile } = moduleRef.exports;

const initial = {
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
  dailyQuests: [
    { id: 'q_play_3', type: 'PLAY_ANY', target: 3, progress: 0, completed: false, xpReward: 30 }
  ],
  lastLoginDate: '2026-05-06'
};

const legacyProfile = {
  stats: {
    wins: 4,
    losses: 2,
    currentStreak: 1,
    bestStreak: 3
  }
};

const migrated = normalizeProfile(legacyProfile, initial);
const checks = [
  ['keeps legacy wins', migrated.stats.wins === 4],
  ['keeps legacy losses', migrated.stats.losses === 2],
  ['fills missing draws', migrated.stats.draws === 0],
  ['fills missing gamesPlayedPerMode', migrated.stats.gamesPlayedPerMode && typeof migrated.stats.gamesPlayedPerMode === 'object'],
  ['fills missing progression level', migrated.progression.level === 1],
  ['fills missing progression xp', migrated.progression.xp === 0],
  ['fills missing daily quests', Array.isArray(migrated.dailyQuests) && migrated.dailyQuests.length === 1],
  ['fills missing lastLoginDate', migrated.lastLoginDate === '2026-05-06']
];

const failed = checks.filter(([, passed]) => !passed);

if (failed.length > 0) {
  console.error('Profile migration verification failed:');
  failed.forEach(([label]) => console.error(`- ${label}`));
  console.error(JSON.stringify(migrated, null, 2));
  process.exit(1);
}

console.log('profile migration verification passed');

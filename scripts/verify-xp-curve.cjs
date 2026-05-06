const fs = require('fs');
const ts = require('typescript');
const vm = require('vm');

const source = fs.readFileSync('src/types/profile.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText;

const moduleRef = { exports: {} };
vm.runInNewContext(js, { module: moduleRef, exports: moduleRef.exports });

const { getXpForLevel } = moduleRef.exports;
const bossXp = Array.from({ length: 98 }, (_, index) => getXpForLevel(index + 1))
  .reduce((total, xp) => total + xp, 0);

const checks = [
  ['level 1 requires 50 XP', getXpForLevel(1) === 50],
  ['level 49 requires 146 XP', getXpForLevel(49) === 146],
  ['level 89 requires 945 XP', getXpForLevel(89) === 945],
  ['level 98 requires 3316 XP', getXpForLevel(98) === 3316],
  ['boss level equals sum of levels 1-98', getXpForLevel(99) === bossXp],
  ['level 100 is capped at 0 XP', getXpForLevel(100) === 0]
];

const failed = checks.filter(([, passed]) => !passed);

if (failed.length > 0) {
  console.error('XP curve verification failed:');
  failed.forEach(([label]) => console.error(`- ${label}`));
  console.error(JSON.stringify({
    level1: getXpForLevel(1),
    level49: getXpForLevel(49),
    level89: getXpForLevel(89),
    level98: getXpForLevel(98),
    level99: getXpForLevel(99),
    bossXp,
    level100: getXpForLevel(100)
  }, null, 2));
  process.exit(1);
}

console.log('xp curve verification passed');

// Simulate the accelerated XP curve
// 1-69: 3% | 70-79: 6% | 80-89: 8% | 90-98: 15% | 99: boss = sum

function getRate(level) {
  if (level >= 90) return 1.15;
  if (level >= 80) return 1.08;
  if (level >= 70) return 1.06;
  return 1.03;
}

// Build the XP table chained (each level builds on the previous)
const xpTable = [0]; // index 0 unused
xpTable[1] = 100; // Level 1 -> 2

for (let i = 2; i <= 98; i++) {
  xpTable[i] = Math.floor(xpTable[i - 1] * getRate(i));
}

// Boss level
let sum1to98 = 0;
for (let i = 1; i <= 98; i++) sum1to98 += xpTable[i];
xpTable[99] = sum1to98;

// Display key levels
const keyLevels = [2, 10, 25, 50, 69, 70, 75, 79, 80, 85, 89, 90, 95, 98, 99];
console.log("=== COURBE ACCÉLÉRÉE (3% → 6% → 8% → 15%) ===\n");
console.log("Niveau | XP requis | Cumul");
console.log("-------|-----------|------");

let cumul = 0;
for (let i = 1; i <= 99; i++) {
  cumul += xpTable[i];
  if (keyLevels.includes(i + 1) || i === 99) {
    console.log(`  ${String(i).padStart(2)}→${String(i+1).padStart(3)}  | ${String(xpTable[i]).padStart(9)} | ${String(cumul).padStart(9)}`);
  }
}

console.log(`\n📊 Total 1→99 : ${sum1to98.toLocaleString()} XP`);
console.log(`👑 Boss 99→100 : ${xpTable[99].toLocaleString()} XP`);
console.log(`🎮 Grand Total : ${(sum1to98 + xpTable[99]).toLocaleString()} XP`);

// Compare with flat 3%
let flatSum = 0;
for (let i = 1; i <= 98; i++) flatSum += Math.floor(100 * Math.pow(1.03, i - 1));
console.log(`\n--- Comparaison avec courbe plate 3% ---`);
console.log(`Plate 3% Total 1→99 : ${flatSum.toLocaleString()} XP`);
console.log(`Plate 3% Grand Total : ${(flatSum * 2).toLocaleString()} XP`);
console.log(`Ratio accélérée/plate : x${((sum1to98 + xpTable[99]) / (flatSum * 2)).toFixed(2)}`);

// Show the gap between consecutive late levels
console.log(`\n--- Écarts entre niveaux tardifs ---`);
for (let i = 87; i <= 98; i++) {
  const gap = xpTable[i + 1] - xpTable[i];
  const pct = ((gap / xpTable[i]) * 100).toFixed(1);
  console.log(`  ${i}→${i+1} vs ${i+1}→${i+2} : ${xpTable[i]} → ${xpTable[i+1]} (gap +${gap}, +${pct}%)`);
}
console.log(`  98→99 vs 99→100 : ${xpTable[98]} → ${xpTable[99]} (BOSS: x${(xpTable[99] / xpTable[98]).toFixed(0)})`);

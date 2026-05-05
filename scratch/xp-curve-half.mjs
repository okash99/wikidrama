const r = l => l >= 90 ? 1.15 : l >= 80 ? 1.08 : l >= 70 ? 1.06 : 1.03;
const x = [0];
x[1] = 50;
for (let i = 2; i <= 98; i++) x[i] = Math.floor(x[i - 1] * r(i));
let s = 0;
for (let i = 1; i <= 98; i++) s += x[i];
x[99] = s;

console.log("=== COURBE ACCÉLÉRÉE BASE 50 ===\n");
[2, 5, 10, 25, 50, 70, 80, 90, 95, 98, 99].forEach(n => {
  console.log(`  Lvl ${String(n-1).padStart(2)}→${String(n).padStart(3)} : ${String(x[n-1]).padStart(6)} XP`);
});
console.log(`  Lvl 99→100 : ${String(x[99]).padStart(6)} XP  (BOSS)`);
console.log(`\n📊 Total 1→99 : ${s.toLocaleString()} XP`);
console.log(`👑 Boss 99→100 : ${s.toLocaleString()} XP`);
console.log(`🎮 Grand Total : ${(s * 2).toLocaleString()} XP`);

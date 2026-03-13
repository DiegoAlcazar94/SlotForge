// src/WinChecker.js

export const PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
];

export class WinChecker {
  check(reelsSymbols, bet = 1) {
    const results = [];
    for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
      const line = PAYLINES[lineIndex];
      const lineSymbols = line.map((rowIndex, reelIndex) => reelsSymbols[reelIndex][rowIndex]);
      const winData = this._evaluateLine(lineSymbols, bet);
      if (winData) {
        results.push({ paylineIndex: lineIndex, payline: line, ...winData });
      }
    }
    return results;
  }

  checkScatter(reelsSymbols, bet = 1) {
    const positions = [];
    for (let reel = 0; reel < reelsSymbols.length; reel++) {
      for (let row = 0; row < reelsSymbols[reel].length; row++) {
        if (reelsSymbols[reel][row].id === 'scatter') {
          positions.push({ reel, row });
        }
      }
    }
    const count = positions.length;
    if (count < 3) return null;

    const scatterSym = reelsSymbols.find(r => r.find(s => s.id === 'scatter'))
                                   .find(s => s.id === 'scatter');
    const payout = (scatterSym.payout?.[count] ?? 0) * bet;
    return { count, payout, positions };
  }

  checkBonus(reelsSymbols) {
    const positions = [];
    for (let reel = 0; reel < reelsSymbols.length; reel++) {
      for (let row = 0; row < reelsSymbols[reel].length; row++) {
        if (reelsSymbols[reel][row].id === 'bonus') {
          positions.push({ reel, row });
        }
      }
    }
    const count = positions.length;
    if (count < 3) return null;
    return { count, positions };
  }

  _evaluateLine(symbols, bet) {
    let baseSymbol = null;
    for (const sym of symbols) {
      if (sym.id !== 'wild') { baseSymbol = sym; break; }
    }
    if (!baseSymbol) baseSymbol = symbols[0];

    let matchCount = 0;
    for (const sym of symbols) {
      if (sym.id === baseSymbol.id || sym.id === 'wild') matchCount++;
      else break;
    }
    if (matchCount < 3) return null;
    const payout = baseSymbol.payout?.[matchCount] ?? 0;
    if (payout === 0) return null;
    return { symbolId: baseSymbol.id, matchCount, payout: payout * bet };
  }
}
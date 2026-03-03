// src/WinChecker.js

export const PAYLINES = [
  [1, 1, 1, 1, 1], // línea central
  [0, 0, 0, 0, 0], // línea superior
  [2, 2, 2, 2, 2], // línea inferior
  [0, 1, 2, 1, 0], // V hacia abajo
  [2, 1, 0, 1, 2], // V hacia arriba
  [0, 0, 1, 2, 2], // diagonal descendente
  [2, 2, 1, 0, 0], // diagonal ascendente
  [1, 0, 0, 0, 1], // U superior
  [1, 2, 2, 2, 1], // U inferior
];

export class WinChecker {
  check(reelsSymbols, bet = 1) {
    const results = [];

    for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
      const line = PAYLINES[lineIndex];

      const lineSymbols = line.map((rowIndex, reelIndex) => {
        return reelsSymbols[reelIndex][rowIndex];
      });

      const winData = this._evaluateLine(lineSymbols, bet);

      if (winData) {
        results.push({
          paylineIndex: lineIndex,
          payline:      line,
          ...winData,
        });
      }
    }

    return results;
  }

  _evaluateLine(symbols, bet) {
    const first    = symbols[0];
    let matchCount = 1;

    for (let i = 1; i < symbols.length; i++) {
      // Wild sustituye a cualquier símbolo
      if (symbols[i].id === first.id || symbols[i].id === 'wild') {
        matchCount++;
      } else if (first.id === 'wild') {
        // Si el primero es wild, intentar con el siguiente símbolo no-wild
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount < 3) return null;

    // El payout viene del propio símbolo definido en SymbolMap.js
    const payout = first.payout?.[matchCount] ?? 0;
    if (payout === 0) return null;

    return {
      symbolId:   first.id,
      matchCount,
      payout:     payout * bet,
    };
  }
}
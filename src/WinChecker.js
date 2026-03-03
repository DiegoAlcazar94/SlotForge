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
    // Encontrar el primer símbolo que no sea wild
    // para saber qué símbolo representa la línea
    let baseSymbol = null;
    for (const sym of symbols) {
      if (sym.id !== 'wild') {
        baseSymbol = sym;
        break;
      }
    }

    // Si todos son wilds, el wild paga con su propio paytable
    if (!baseSymbol) baseSymbol = symbols[0];

    let matchCount = 0;

    for (const sym of symbols) {
      if (sym.id === baseSymbol.id || sym.id === 'wild') {
        matchCount++;
      } else {
        break; // cadena rota
      }
    }

    if (matchCount < 3) return null;

    const payout = baseSymbol.payout?.[matchCount] ?? 0;
    if (payout === 0) return null;

    return {
      symbolId:   baseSymbol.id,
      matchCount,
      payout:     payout * bet,
    };
  }
}
// src/WinChecker.js

// Cada payline es un array de 5 índices de fila [reel0, reel1, reel2, reel3, reel4]
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

// Multiplicadores por símbolo (cuánto paga cada combo x3, x4, x5)
export const PAYTABLE = {
  seven:  { 3: 50,  4: 150, 5: 500  },
  bar:    { 3: 20,  4: 60,  5: 200  },
  bell:   { 3: 10,  4: 30,  5: 100  },
  cherry: { 3: 5,   4: 15,  5: 50   },
  lemon:  { 3: 3,   4: 8,   5: 25   },
  grape:  { 3: 3,   4: 8,   5: 25   },
};

export class WinChecker {
  /**
   * @param {Array} reelsSymbols - Array de 5 rodillos, cada uno con 3 símbolos
   * Ejemplo: [[{id:'seven'}, {id:'bar'}, {id:'lemon'}], [...], ...]
   */
  check(reelsSymbols, bet = 1) {
    const results = [];

    for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
      const line = PAYLINES[lineIndex];

      // Extraer el símbolo de cada rodillo según el índice de fila de esta payline
      const lineSymbols = line.map((rowIndex, reelIndex) => {
        return reelsSymbols[reelIndex][rowIndex];
      });

      const winData = this._evaluateLine(lineSymbols, bet);

      if (winData) {
        results.push({
          paylineIndex: lineIndex,
          payline: line,
          ...winData,
        });
      }
    }

    return results; // Array vacío = no hay victorias
  }

  _evaluateLine(symbols, bet) {
    const firstId = symbols[0].id;
    let matchCount = 1;

    // Contar cuántos símbolos consecutivos desde la izquierda son iguales
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i].id === firstId) {
        matchCount++;
      } else {
        break; // En slots, la cadena se rompe en cuanto hay uno distinto
      }
    }

    // Mínimo 3 en línea para ganar
    if (matchCount < 3) return null;

    const payout = PAYTABLE[firstId]?.[matchCount] ?? 0;
    if (payout === 0) return null;

    return {
      symbolId: firstId,
      matchCount,
      payout: payout * bet,
    };
  }
}
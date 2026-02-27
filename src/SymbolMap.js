// src/SymbolMap.js

export const SYMBOLS = [
  { id: 'seven',    label: '7',  color: 0xFF4444, weight: 1  },
  { id: 'bar',      label: 'BAR', color: 0xFFD700, weight: 3  },
  { id: 'bell',     label: 'B',  color: 0xFF9900, weight: 5  },
  { id: 'cherry',   label: 'CH', color: 0xFF2266, weight: 8  },
  { id: 'lemon',    label: 'LE', color: 0xCCFF00, weight: 10 },
  { id: 'grape',    label: 'GR', color: 0xAA44FF, weight: 10 },
];

// Genera un pool ponderado para el RNG
export function buildWeightedPool() {
  const pool = [];
  for (const symbol of SYMBOLS) {
    for (let i = 0; i < symbol.weight; i++) {
      pool.push(symbol);
    }
  }
  return pool;
}

export function getRandomSymbol(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
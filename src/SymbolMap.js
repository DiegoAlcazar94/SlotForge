// src/SymbolMap.js

export const SYMBOLS = [
  // Especiales
  { id: 'wild',    path: 'src/Assets/Symbols/Wild.png',    weight: 1,  payout: { 3: 100, 4: 300, 5: 1000 } },
  { id: 'scatter', path: 'src/Assets/Symbols/Scatter.png', weight: 2,  payout: { 3: 50,  4: 150, 5: 500  } },
  { id: 'bonus',   path: 'src/Assets/Symbols/Bonus.png',   weight: 2,  payout: { 3: 40,  4: 120, 5: 400  } },
  // Dinosaurios
  { id: '4',       path: 'src/Assets/Symbols/4.png',       weight: 3,  payout: { 3: 20,  4: 60,  5: 200  } },
  { id: '1',       path: 'src/Assets/Symbols/1.png',       weight: 4,  payout: { 3: 15,  4: 45,  5: 150  } },
  { id: '2',       path: 'src/Assets/Symbols/2.png',       weight: 5,  payout: { 3: 10,  4: 30,  5: 100  } },
  { id: '3',       path: 'src/Assets/Symbols/3.png',       weight: 5,  payout: { 3: 10,  4: 30,  5: 100  } },
  // Cartas
  { id: 'A',       path: 'src/Assets/Symbols/A.png',       weight: 7,  payout: { 3: 5,   4: 15,  5: 50   } },
  { id: 'K',       path: 'src/Assets/Symbols/K.png',       weight: 7,  payout: { 3: 5,   4: 15,  5: 50   } },
  { id: 'Q',       path: 'src/Assets/Symbols/Q.png',       weight: 8,  payout: { 3: 3,   4: 8,   5: 25   } },
  { id: 'J',       path: 'src/Assets/Symbols/J.png',       weight: 8,  payout: { 3: 3,   4: 8,   5: 25   } },
  { id: '10',      path: 'src/Assets/Symbols/10.png',      weight: 8,  payout: { 3: 3,   4: 8,   5: 25   } },
];

export function buildWeightedPool() {
  const pool = [];
  for (const sym of SYMBOLS) {
    for (let i = 0; i < sym.weight; i++) {
      pool.push(sym);
    }
  }
  return pool;
}

export function getRandomSymbol(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
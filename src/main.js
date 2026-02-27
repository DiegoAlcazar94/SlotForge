// src/main.js
import { buildWeightedPool } from './SymbolMap.js';
import { Reel } from './Reel.js';
import { WinChecker } from './WinChecker.js';

const APP_WIDTH  = 800;
const APP_HEIGHT = 600;
const REEL_COUNT = 5;
const ROW_COUNT  = 3;

const app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x0a0a0f,
  antialias: true,
});

document.body.appendChild(app.view);

const weightedPool = buildWeightedPool();

// Zona de rodillos — centrada en pantalla
const reelAreaX = 100;
const reelAreaY = 80;
const reelWidth = 120;
const reelHeight = 360; // 3 filas x 120px cada una

const reels = [];
const winChecker = new WinChecker();
let reelsStopped = 0;

for (let i = 0; i < REEL_COUNT; i++) {
  const reel = new Reel(
    app,
    weightedPool,
    reelAreaX + i * (reelWidth + 10),
    reelAreaY,
    reelWidth,
    reelHeight,
    ROW_COUNT
  );
  reels.push(reel);
}

// Botón de spin temporal (lo estilizaremos en el siguiente commit)
spinBtn.addEventListener('click', () => {
  reelsStopped = 0;

  reels.forEach((reel, i) => {
    setTimeout(() => {
      reel.spin(() => {
        // Callback que se ejecuta cuando este rodillo para
        reelsStopped++;
        if (reelsStopped === reels.length) {
          _checkWins();
        }
      });
    }, i * 150);
  });
});

function _checkWins() {
  // Construir la matriz de símbolos visibles
  const matrix = reels.map(reel => reel.getVisibleSymbols());
  const wins = winChecker.check(matrix);

  if (wins.length > 0) {
    const total = wins.reduce((sum, w) => sum + w.payout, 0);
    console.log(`WIN! Total payout: ${total}`, wins);
    // Aquí conectaremos la UI en el siguiente commit
  } else {
    console.log('No win');
  }
}
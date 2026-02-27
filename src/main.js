// src/main.js
import { buildWeightedPool } from './SymbolMap.js';
import { Reel } from './Reel.js';

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
const spinBtn = document.createElement('button');
spinBtn.textContent = 'SPIN';
spinBtn.style.cssText = `
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 48px;
  font-size: 24px;
  background: #FFD700;
  border: none;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 4px;
`;
document.body.appendChild(spinBtn);

spinBtn.addEventListener('click', () => {
  reels.forEach((reel, i) => {
    // Cada rodillo empieza con un pequeño delay escalonado
    setTimeout(() => reel.spin(), i * 150);
  });
});
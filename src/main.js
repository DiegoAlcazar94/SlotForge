// src/main.js
import { buildWeightedPool } from './SymbolMap.js';
import { Reel } from './Reel.js';
import { WinChecker } from './WinChecker.js';
import { WinAnimator } from './WinAnimator.js';
import { SoundManager } from './SoundManager.js';
import { ScaleManager } from './ScaleManager.js';
import { LoadingScreen } from './LoadingScreen.js';
import { StartScreen } from './StartScreen.js';

const APP_WIDTH   = 1392;
const APP_HEIGHT  = 768;
const REEL_COUNT  = 5;
const ROW_COUNT   = 3;
const SYMBOL_SIZE = 110;

const app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x0a0a0f,
  antialias: true,
});
document.body.appendChild(app.view);

const scaleManager = new ScaleManager(app, APP_WIDTH, APP_HEIGHT);

// ── CAPA 1: FONDO ─────────────────────────────────────────
const background  = PIXI.Sprite.from('src/Assets/Symbols/FondoFinal.png');
background.width  = APP_WIDTH;
background.height = APP_HEIGHT;
app.stage.addChild(background);

const weightedPool = buildWeightedPool();
const winChecker   = new WinChecker();
const soundManager = new SoundManager();
let reelsStopped   = 0;
let balance        = 1000;
let bet            = 10;
let isSpinning     = false;
let autoPlaying    = false;
let autoSpinsLeft  = 0;

// ── CAPA 2: RODILLOS ──────────────────────────────────────
const reelAreaX = 418;
const reelAreaY = 210;
const reelGap   = 6;

const reels = [];
for (let i = 0; i < REEL_COUNT; i++) {
  const reel = new Reel(
    app,
    weightedPool,
    reelAreaX + i * (SYMBOL_SIZE + reelGap),
    reelAreaY,
    SYMBOL_SIZE,
    SYMBOL_SIZE * ROW_COUNT,
    ROW_COUNT
  );
  reels.push(reel);
}

const winAnimator = new WinAnimator(app, reelAreaX, reelAreaY);

// ── CAPA 3: MARCO — encima de rodillos ────────────────────
const marco  = PIXI.Sprite.from('src/Assets/Symbols/Marco.png');
marco.width  = APP_WIDTH;
marco.height = APP_HEIGHT;
app.stage.addChild(marco);

// ── PANEL INFERIOR ────────────────────────────────────────
const panel = new PIXI.Graphics();
panel.beginFill(0x0a0a0f, 0.88);
panel.drawRect(0, APP_HEIGHT - 140, APP_WIDTH, 140);
panel.endFill();
app.stage.addChild(panel);

const panelLine = new PIXI.Graphics();
panelLine.lineStyle(2, 0x3333aa, 0.8);
panelLine.moveTo(0, APP_HEIGHT - 140);
panelLine.lineTo(APP_WIDTH, APP_HEIGHT - 140);
app.stage.addChild(panelLine);

const labelStyle = new PIXI.TextStyle({
  fontFamily:    'Arial',
  fontSize:      14,
  fill:          0x8888bb,
  letterSpacing: 3,
});

const valueStyle = new PIXI.TextStyle({
  fontFamily: 'Arial Black',
  fontSize:   24,
  fill:       0xFFFFFF,
  fontWeight: 'bold',
});

// ── BALANCE ───────────────────────────────────────────────
const balanceLabel = new PIXI.Text('BALANCE', labelStyle);
balanceLabel.x = 80;
balanceLabel.y = APP_HEIGHT - 125;
app.stage.addChild(balanceLabel);

const balanceText = new PIXI.Text(`${balance}`, valueStyle);
balanceText.x = 80;
balanceText.y = APP_HEIGHT - 105;
app.stage.addChild(balanceText);

// ── BET ───────────────────────────────────────────────────
const betLabel = new PIXI.Text('BET', labelStyle);
betLabel.x = 80;
betLabel.y = APP_HEIGHT - 68;
app.stage.addChild(betLabel);

const betText = new PIXI.Text(`${bet}`, valueStyle);
betText.x = 80;
betText.y = APP_HEIGHT - 48;
app.stage.addChild(betText);

// ── WIN ───────────────────────────────────────────────────
const winLabel = new PIXI.Text('WIN', labelStyle);
winLabel.x = 300;
winLabel.y = APP_HEIGHT - 125;
app.stage.addChild(winLabel);

const winText = new PIXI.Text('0', valueStyle);
winText.x = 300;
winText.y = APP_HEIGHT - 105;
app.stage.addChild(winText);

// ── AUTO SPINS RESTANTES ──────────────────────────────────
const autoLabel = new PIXI.Text('AUTO', labelStyle);
autoLabel.x = 520;
autoLabel.y = APP_HEIGHT - 125;
app.stage.addChild(autoLabel);

const autoText = new PIXI.Text('', valueStyle);
autoText.x = 520;
autoText.y = APP_HEIGHT - 105;
app.stage.addChild(autoText);

// ── FUNCIÓN BOTONES PEQUEÑOS ──────────────────────────────
function makeTextButton(label, x, y, onClick) {
  const container       = new PIXI.Container();
  container.x           = x;
  container.y           = y;
  container.interactive = true;
  container.cursor      = 'pointer';

  const bg = new PIXI.Graphics();
  bg.beginFill(0x1e1e3f);
  bg.lineStyle(1, 0x5555cc);
  bg.drawRoundedRect(0, 0, 44, 30, 6);
  bg.endFill();
  container.addChild(bg);

  const txt = new PIXI.Text(label, {
    fontFamily: 'Arial Black',
    fontSize:   15,
    fill:       0xaaaaff,
  });
  txt.anchor.set(0.5);
  txt.x = 22;
  txt.y = 15;
  container.addChild(txt);

  container.on('pointerdown', onClick);
  container.on('pointerover', () => { bg.tint = 0xaaaaff; });
  container.on('pointerout',  () => { bg.tint = 0xFFFFFF; });

  app.stage.addChild(container);
  return container;
}

// ── BET - y + ─────────────────────────────────────────────
makeTextButton('-', 210, APP_HEIGHT - 58, () => {
  if (!isSpinning && !autoPlaying) {
    if (bet > 1) { bet = Math.max(1, bet - 5); betText.text = `${bet}`; }
  }
});

makeTextButton('+', 262, APP_HEIGHT - 58, () => {
  if (!isSpinning && !autoPlaying) {
    if (bet < balance) { bet = Math.min(balance, bet + 5); betText.text = `${bet}`; }
  }
});

// ── BOTÓN SPIN ────────────────────────────────────────────
const spinContainer       = new PIXI.Container();
spinContainer.x           = APP_WIDTH / 2 - 80;
spinContainer.y           = APP_HEIGHT - 125;
spinContainer.interactive = true;
spinContainer.cursor      = 'pointer';

const spinBg = new PIXI.Graphics();
_drawSpinBtn(spinBg, false);
spinContainer.addChild(spinBg);

const spinTxt = new PIXI.Text('SPIN', {
  fontFamily:    'Arial Black',
  fontSize:      30,
  fill:          0x0a0a0f,
  fontWeight:    'bold',
  letterSpacing: 4,
});
spinTxt.anchor.set(0.5);
spinTxt.x = 80;
spinTxt.y = 52;
spinContainer.addChild(spinTxt);

spinContainer.on('pointerdown', _onSpin);
spinContainer.on('pointerover', () => {
  if (!isSpinning) { spinBg.tint = 0xddaa00; }
});
spinContainer.on('pointerout', () => { spinBg.tint = 0xFFFFFF; });
app.stage.addChild(spinContainer);

// ── SELECTOR AUTOSPINS ────────────────────────────────────
const autoBtnOptions = [10, 25, 50, 100];
let selectedAuto     = 0;

const spinsLabel = new PIXI.Text('SPINS', labelStyle);
spinsLabel.x = APP_WIDTH - 230;
spinsLabel.y = APP_HEIGHT - 125;
app.stage.addChild(spinsLabel);

// Flecha izquierda
const arrowLeft       = new PIXI.Container();
arrowLeft.x           = APP_WIDTH - 235;
arrowLeft.y           = APP_HEIGHT - 62;
arrowLeft.interactive = true;
arrowLeft.cursor      = 'pointer';
app.stage.addChild(arrowLeft);

const arrowLeftBg = new PIXI.Graphics();
arrowLeftBg.beginFill(0x1e1e3f);
arrowLeftBg.lineStyle(1, 0x5555cc);
arrowLeftBg.drawRoundedRect(0, 0, 32, 30, 6);
arrowLeftBg.endFill();
arrowLeft.addChild(arrowLeftBg);

const arrowLeftTxt = new PIXI.Text('◀', {
  fontFamily: 'Arial Black', fontSize: 13, fill: 0xaaaaff,
});
arrowLeftTxt.anchor.set(0.5);
arrowLeftTxt.x = 16;
arrowLeftTxt.y = 15;
arrowLeft.addChild(arrowLeftTxt);

arrowLeft.on('pointerdown', () => {
  if (!autoPlaying) {
    selectedAuto      = (selectedAuto - 1 + autoBtnOptions.length) % autoBtnOptions.length;
    spinCountTxt.text = `${autoBtnOptions[selectedAuto]}`;
  }
});
arrowLeft.on('pointerover', () => { arrowLeftBg.tint = 0xaaaaff; });
arrowLeft.on('pointerout',  () => { arrowLeftBg.tint = 0xFFFFFF; });

// Número de spins
const spinCountTxt = new PIXI.Text(`${autoBtnOptions[selectedAuto]}`, {
  fontFamily: 'Arial Black', fontSize: 22, fill: 0xFFFFFF, fontWeight: 'bold',
});
spinCountTxt.anchor.set(0.5);
spinCountTxt.x = APP_WIDTH - 178;
spinCountTxt.y = APP_HEIGHT - 47;
app.stage.addChild(spinCountTxt);

// Flecha derecha
const arrowRight       = new PIXI.Container();
arrowRight.x           = APP_WIDTH - 150;
arrowRight.y           = APP_HEIGHT - 62;
arrowRight.interactive = true;
arrowRight.cursor      = 'pointer';
app.stage.addChild(arrowRight);

const arrowRightBg = new PIXI.Graphics();
arrowRightBg.beginFill(0x1e1e3f);
arrowRightBg.lineStyle(1, 0x5555cc);
arrowRightBg.drawRoundedRect(0, 0, 32, 30, 6);
arrowRightBg.endFill();
arrowRight.addChild(arrowRightBg);

const arrowRightTxt = new PIXI.Text('▶', {
  fontFamily: 'Arial Black', fontSize: 13, fill: 0xaaaaff,
});
arrowRightTxt.anchor.set(0.5);
arrowRightTxt.x = 16;
arrowRightTxt.y = 15;
arrowRight.addChild(arrowRightTxt);

arrowRight.on('pointerdown', () => {
  if (!autoPlaying) {
    selectedAuto      = (selectedAuto + 1) % autoBtnOptions.length;
    spinCountTxt.text = `${autoBtnOptions[selectedAuto]}`;
  }
});
arrowRight.on('pointerover', () => { arrowRightBg.tint = 0xaaaaff; });
arrowRight.on('pointerout',  () => { arrowRightBg.tint = 0xFFFFFF; });

// ── BOTÓN AUTO/STOP ───────────────────────────────────────
const autoContainer       = new PIXI.Container();
autoContainer.x           = APP_WIDTH - 235;
autoContainer.y           = APP_HEIGHT - 118;
autoContainer.interactive = true;
autoContainer.cursor      = 'pointer';
app.stage.addChild(autoContainer);

const autoBg = new PIXI.Graphics();
_drawAutoBtn(autoBg, false);
autoContainer.addChild(autoBg);

const autoTxt = new PIXI.Text('AUTO', {
  fontFamily:    'Arial Black',
  fontSize:      20,
  fill:          0x0a0a0f,
  fontWeight:    'bold',
  letterSpacing: 2,
});
autoTxt.anchor.set(0.5);
autoTxt.x = 60;
autoTxt.y = 24;
autoContainer.addChild(autoTxt);

autoContainer.on('pointerdown', _onAutoPlay);
autoContainer.on('pointerover', () => { autoBg.tint = 0xbbccff; });
autoContainer.on('pointerout',  () => { autoBg.tint = 0xFFFFFF; });

function _drawAutoBtn(g, active) {
  g.clear();
  g.beginFill(active ? 0xff4444 : 0x4488ff);
  g.drawRoundedRect(0, 0, 120, 48, 10);
  g.endFill();
}

function _drawSpinBtn(g, disabled) {
  g.clear();
  g.beginFill(disabled ? 0x555555 : 0xFFD700);
  g.drawRoundedRect(0, 0, 160, 105, 16);
  g.endFill();
}

// ── LÓGICA AUTOPLAY ───────────────────────────────────────
function _onAutoPlay() {
  if (isSpinning && !autoPlaying) return;

  if (autoPlaying) {
    autoPlaying   = false;
    autoSpinsLeft = 0;
    autoText.text = '';
    autoTxt.text  = 'AUTO';
    _drawAutoBtn(autoBg, false);
    return;
  }

  autoSpinsLeft = autoBtnOptions[selectedAuto];
  autoPlaying   = true;
  autoTxt.text  = 'STOP';
  _drawAutoBtn(autoBg, true);
  _onSpin();
}

// ── LÓGICA SPIN ───────────────────────────────────────────
function _onSpin() {
  if (isSpinning || balance < bet) return;

  winAnimator.clear();
  isSpinning       = true;
  reelsStopped     = 0;
  winText.text     = '0';
  balance         -= bet;
  balanceText.text = `${balance}`;

  _drawSpinBtn(spinBg, true);

  reels.forEach((reel, i) => {
    setTimeout(() => {
      soundManager.playReelTick();
      reel.spin(() => {
        soundManager.playReelStop();
        reelsStopped++;
        if (reelsStopped === reels.length) {
          _checkWins();
        }
      });
    }, i * 150);
  });
}

function _checkWins() {
  const matrix = reels.map(reel => reel.getVisibleSymbols());
  const wins   = winChecker.check(matrix, bet);

  winAnimator.clear();

  if (wins.length > 0) {
    const total      = wins.reduce((sum, w) => sum + w.payout, 0);
    balance         += total;
    winText.text     = `${total}`;
    balanceText.text = `${balance}`;
    winAnimator.playWins(wins, reels);
    soundManager.playWin(total / bet);
  } else {
    soundManager.playNoWin();
  }

  isSpinning = false;
  _drawSpinBtn(spinBg, false);

  if (autoPlaying) {
    autoSpinsLeft--;
    autoText.text = `${autoSpinsLeft}`;

    if (autoSpinsLeft <= 0 || balance < bet) {
      autoPlaying   = false;
      autoText.text = '';
      autoTxt.text  = 'AUTO';
      _drawAutoBtn(autoBg, false);
    } else {
      setTimeout(() => _onSpin(), 600);
    }
  }
}

// ── PANTALLAS ENCIMA DEL JUEGO ────────────────────────────
new LoadingScreen(app, () => {
  new StartScreen(app, () => {
    console.log('ready');
  });
});
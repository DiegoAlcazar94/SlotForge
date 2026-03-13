// src/main.js
import { buildWeightedPool } from './SymbolMap.js';
import { Reel } from './Reel.js';
import { WinChecker } from './WinChecker.js';
import { WinAnimator } from './WinAnimator.js';
import { SoundManager } from './SoundManager.js';
import { ScaleManager } from './ScaleManager.js';
import { LoadingScreen } from './LoadingScreen.js';
import { StartScreen } from './StartScreen.js';
import { FreeSpinsManager } from './FreeSpinsManager.js';

const APP_WIDTH   = 1392;
const APP_HEIGHT  = 768;
const REEL_COUNT  = 5;
const ROW_COUNT   = 3;
const SYMBOL_SIZE = 100;
const PANEL_H     = 185;

const MARCO_W = 1044;
const MARCO_H = 576;
const MARCO_X = (APP_WIDTH  - MARCO_W) / 2;
const MARCO_Y = 30;

const reelAreaX = 450;
const reelAreaY = 190;
const reelGap   = 5;

// ── ESCALAS UI ────────────────────────────────────────────
const SCALE_BANNER   = 0.5;
const SCALE_AUTO_BTN = 0.105;
const SCALE_BET_BTN  = 0.06;
const SCALE_HUECO    = 0.2;
const SCALE_GIRL1    = 1.0;
const SCALE_GIRL2    = 1.0;

// ── TAMAÑO BOTÓN SPIN ─────────────────────────────────────
const SPIN_BTN_SIZE  = 210;

// ── POSICIONES PANEL — de izquierda a derecha ─────────────
const PANEL_Y        = APP_HEIGHT - PANEL_H;
const PANEL_MID_Y    = PANEL_Y + PANEL_H / 2;       // centro vertical del panel

const BAL_X          = 60;                           // 1. Balance
const BET_CENTER_X   = 280;                          // 2. Bet controls
const BET_GAP        = 55;                           // separación less/add respecto al hueco
const SPIN_X         = APP_WIDTH / 2 - SPIN_BTN_SIZE / 2; // 3. Spin (centrado)
const AUTO_X         = APP_WIDTH / 2 + 140;          // 4. Auto button
const SPINS_X        = APP_WIDTH - 220;              // 5. Selector spins

const app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x0a0a0f,
  antialias: true,
});
document.body.appendChild(app.view);

const scaleManager = new ScaleManager(app, APP_WIDTH, APP_HEIGHT);

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

const reels = [];
for (let i = 0; i < REEL_COUNT; i++) {
  const reel = new Reel(
    app, weightedPool,
    reelAreaX + i * (SYMBOL_SIZE + reelGap),
    reelAreaY, SYMBOL_SIZE, SYMBOL_SIZE * ROW_COUNT, ROW_COUNT
  );
  reels.push(reel);
}

// ── MARCO ─────────────────────────────────────────────────
const marco  = PIXI.Sprite.from('src/Assets/Symbols/Marco.png');
marco.width  = MARCO_W;
marco.height = MARCO_H;
marco.x      = MARCO_X;
marco.y      = MARCO_Y;
app.stage.addChild(marco);

// ── GIRL LEFT ─────────────────────────────────────────────
const girl1  = PIXI.Sprite.from('src/Assets/Symbols/Girl1.png');
girl1.height = MARCO_H * SCALE_GIRL1;
girl1.width  = girl1.height * (500 / 800);
girl1.x      = MARCO_X - girl1.width + 170;
girl1.y      = MARCO_Y;
app.stage.addChild(girl1);

// ── GIRL RIGHT ────────────────────────────────────────────
const girl2  = PIXI.Sprite.from('src/Assets/Symbols/Girl2.png');
girl2.height = MARCO_H * SCALE_GIRL2;
girl2.width  = girl2.height * (500 / 800);
girl2.x      = MARCO_X + MARCO_W - 190;
girl2.y      = MARCO_Y;
app.stage.addChild(girl2);

const winAnimator = new WinAnimator(app, reelAreaX, reelAreaY, SYMBOL_SIZE, reelGap, girl1, girl2);
const freeSpinsManager = new FreeSpinsManager(app, APP_WIDTH, APP_HEIGHT);
let inFreeSpins = false;

// ── BANNER INFERIOR ───────────────────────────────────────
const bannerInferior = PIXI.Sprite.from('src/Assets/Symbols/BannerInferior.png');
bannerInferior.anchor.set(0.5, 1);
bannerInferior.x = APP_WIDTH / 2;
bannerInferior.y = APP_HEIGHT;
bannerInferior.scale.set(SCALE_BANNER);
app.stage.addChild(bannerInferior);

const labelStyle = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 14, fill: 0x8888bb, letterSpacing: 3 });
const valueStyle = new PIXI.TextStyle({ fontFamily: 'Arial Black', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' });

// ── 1. BALANCE ────────────────────────────────────────────
const balanceLabel = new PIXI.Text('BALANCE', labelStyle);
balanceLabel.anchor.set(0, 0.5);
balanceLabel.x = BAL_X;
balanceLabel.y = PANEL_MID_Y - 18;
app.stage.addChild(balanceLabel);

const balanceText = new PIXI.Text(`${balance}`, valueStyle);
balanceText.anchor.set(0, 0.5);
balanceText.x = BAL_X;
balanceText.y = PANEL_MID_Y + 12;
app.stage.addChild(balanceText);

// ── 2. BET CONTROLS ───────────────────────────────────────
const betLabel = new PIXI.Text('BET', labelStyle);
betLabel.anchor.set(0.5, 0.5);
betLabel.x = BET_CENTER_X;
betLabel.y = PANEL_MID_Y - 38;
app.stage.addChild(betLabel);

const huecoSprite = PIXI.Sprite.from('src/Assets/Symbols/Hueco.png');
huecoSprite.scale.set(SCALE_HUECO);
huecoSprite.anchor.set(0.5, 0.5);
huecoSprite.x = BET_CENTER_X;
huecoSprite.y = PANEL_MID_Y + 10;
app.stage.addChild(huecoSprite);

const betText = new PIXI.Text(`${bet}`, valueStyle);
betText.anchor.set(0.5, 0.5);
betText.x = BET_CENTER_X;
betText.y = PANEL_MID_Y + 10;
app.stage.addChild(betText);

const lessContainer       = new PIXI.Container();
lessContainer.interactive = true;
lessContainer.cursor      = 'pointer';
const lessBtn             = PIXI.Sprite.from('src/Assets/Symbols/ButtonLess.png');
lessBtn.scale.set(SCALE_BET_BTN);
lessBtn.anchor.set(0.5, 0.5);
lessContainer.addChild(lessBtn);
lessContainer.x = BET_CENTER_X - BET_GAP;
lessContainer.y = PANEL_MID_Y + 10;
lessContainer.on('pointerdown', () => {
  lessBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonLess2.png');
  if (!isSpinning && !autoPlaying && bet > 1) { bet = Math.max(1, bet - 5); betText.text = `${bet}`; }
});
lessContainer.on('pointerup',  () => { lessBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonLess.png'); });
lessContainer.on('pointerout', () => { lessBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonLess.png'); });
app.stage.addChild(lessContainer);

const addContainer       = new PIXI.Container();
addContainer.interactive = true;
addContainer.cursor      = 'pointer';
const addBtn             = PIXI.Sprite.from('src/Assets/Symbols/ButtonAdd.png');
addBtn.scale.set(SCALE_BET_BTN);
addBtn.anchor.set(0.5, 0.5);
addContainer.addChild(addBtn);
addContainer.x = BET_CENTER_X + BET_GAP;
addContainer.y = PANEL_MID_Y + 10;
addContainer.on('pointerdown', () => {
  addBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAdd2.png');
  if (!isSpinning && !autoPlaying && bet < balance) { bet = Math.min(balance, bet + 5); betText.text = `${bet}`; }
});
addContainer.on('pointerup',  () => { addBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAdd.png'); });
addContainer.on('pointerout', () => { addBtn.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAdd.png'); });
app.stage.addChild(addContainer);

// ── 3. BOTÓN SPIN ─────────────────────────────────────────
const spinContainer       = new PIXI.Container();
spinContainer.x           = SPIN_X;
spinContainer.y           = APP_HEIGHT - PANEL_H - 30;
spinContainer.interactive = true;
spinContainer.cursor      = 'pointer';

const spinBtn  = PIXI.Sprite.from('src/Assets/Symbols/Button1.png');
spinBtn.width  = SPIN_BTN_SIZE;
spinBtn.height = SPIN_BTN_SIZE;
spinContainer.addChild(spinBtn);

spinContainer.on('pointerdown', () => {
  spinBtn.texture = PIXI.Texture.from('src/Assets/Symbols/Button2.png');
  _onSpin();
});
spinContainer.on('pointerup',  () => { spinBtn.texture = PIXI.Texture.from('src/Assets/Symbols/Button1.png'); });
spinContainer.on('pointerout', () => { spinBtn.texture = PIXI.Texture.from('src/Assets/Symbols/Button1.png'); });
app.stage.addChild(spinContainer);

// ── 4. BOTÓN AUTO ─────────────────────────────────────────
const autoContainer       = new PIXI.Container();
autoContainer.x           = AUTO_X;
autoContainer.y           = PANEL_MID_Y - 25;
autoContainer.interactive = true;
autoContainer.cursor      = 'pointer';

const autoBtnSprite = PIXI.Sprite.from('src/Assets/Symbols/ButtonAuto.png');
autoBtnSprite.scale.set(SCALE_AUTO_BTN);
autoContainer.addChild(autoBtnSprite);
app.stage.addChild(autoContainer);

autoContainer.on('pointerdown', () => { _onAutoPlay(); });
autoContainer.on('pointerup',   () => {});
autoContainer.on('pointerout',  () => {});

// ── 5. SELECTOR AUTOSPINS ─────────────────────────────────
const autoBtnOptions = [10, 25, 50, 100];
let selectedAuto     = 0;

const spinsLabel = new PIXI.Text('SPINS', labelStyle);
spinsLabel.anchor.set(0.5, 0.5);
spinsLabel.x = SPINS_X;
spinsLabel.y = PANEL_MID_Y - 38;
app.stage.addChild(spinsLabel);

const arrowLeft       = new PIXI.Container();
arrowLeft.x           = SPINS_X - 55;
arrowLeft.y           = PANEL_MID_Y;
arrowLeft.interactive = true;
arrowLeft.cursor      = 'pointer';
app.stage.addChild(arrowLeft);

const arrowLeftBg = new PIXI.Graphics();
arrowLeftBg.beginFill(0x1e1e3f);
arrowLeftBg.lineStyle(1, 0x5555cc);
arrowLeftBg.drawRoundedRect(0, 0, 32, 30, 6);
arrowLeftBg.endFill();
arrowLeft.addChild(arrowLeftBg);

const arrowLeftTxt = new PIXI.Text('◀', { fontFamily: 'Arial Black', fontSize: 13, fill: 0xaaaaff });
arrowLeftTxt.anchor.set(0.5); arrowLeftTxt.x = 16; arrowLeftTxt.y = 15;
arrowLeft.addChild(arrowLeftTxt);
arrowLeft.on('pointerdown', () => {
  if (!autoPlaying) { selectedAuto = (selectedAuto - 1 + autoBtnOptions.length) % autoBtnOptions.length; spinCountTxt.text = `${autoBtnOptions[selectedAuto]}`; }
});
arrowLeft.on('pointerover', () => { arrowLeftBg.tint = 0xaaaaff; });
arrowLeft.on('pointerout',  () => { arrowLeftBg.tint = 0xFFFFFF; });

const spinCountTxt = new PIXI.Text(`${autoBtnOptions[selectedAuto]}`, { fontFamily: 'Arial Black', fontSize: 22, fill: 0xFFFFFF, fontWeight: 'bold' });
spinCountTxt.anchor.set(0.5, 0.5);
spinCountTxt.x = SPINS_X;
spinCountTxt.y = PANEL_MID_Y + 15;
app.stage.addChild(spinCountTxt);

const arrowRight       = new PIXI.Container();
arrowRight.x           = SPINS_X + 22;
arrowRight.y           = PANEL_MID_Y;
arrowRight.interactive = true;
arrowRight.cursor      = 'pointer';
app.stage.addChild(arrowRight);

const arrowRightBg = new PIXI.Graphics();
arrowRightBg.beginFill(0x1e1e3f);
arrowRightBg.lineStyle(1, 0x5555cc);
arrowRightBg.drawRoundedRect(0, 0, 32, 30, 6);
arrowRightBg.endFill();
arrowRight.addChild(arrowRightBg);

const arrowRightTxt = new PIXI.Text('▶', { fontFamily: 'Arial Black', fontSize: 13, fill: 0xaaaaff });
arrowRightTxt.anchor.set(0.5); arrowRightTxt.x = 16; arrowRightTxt.y = 15;
arrowRight.addChild(arrowRightTxt);
arrowRight.on('pointerdown', () => {
  if (!autoPlaying) { selectedAuto = (selectedAuto + 1) % autoBtnOptions.length; spinCountTxt.text = `${autoBtnOptions[selectedAuto]}`; }
});
arrowRight.on('pointerover', () => { arrowRightBg.tint = 0xaaaaff; });
arrowRight.on('pointerout',  () => { arrowRightBg.tint = 0xFFFFFF; });

// ── AUTO SPINS RESTANTES ──────────────────────────────────
const autoText = new PIXI.Text('', new PIXI.TextStyle({ fontFamily: 'Arial Black', fontSize: 18, fill: 0xFFFFFF }));
autoText.anchor.set(0.5, 0.5);
autoText.x = SPINS_X;
autoText.y = PANEL_MID_Y - 15;
app.stage.addChild(autoText);

function _onAutoPlay() {
  if (isSpinning && !autoPlaying) return;
  if (autoPlaying) {
    autoPlaying   = false;
    autoSpinsLeft = 0;
    autoText.text = '';
    autoBtnSprite.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAuto.png');
    return;
  }
  autoSpinsLeft = autoBtnOptions[selectedAuto];
  autoPlaying   = true;
  autoBtnSprite.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAuto2.png');
  _onSpin();
}

function _onSpin() {
  if (isSpinning) return;
  if (!inFreeSpins && balance < bet) return;

  winAnimator.clear();
  isSpinning   = true;
  reelsStopped = 0;

  if (!inFreeSpins) {
    balance         -= bet;
    balanceText.text = `${balance}`;
  }

  reels.forEach((reel, i) => {
    setTimeout(() => {
      soundManager.playReelTick();
      reel.spin(() => {
        soundManager.playReelStop();
        reelsStopped++;
        if (reelsStopped === reels.length) _checkWins();
      });
    }, i * 150);
  });
}

function _checkWins() {
  const matrix  = reels.map(reel => reel.getVisibleSymbols());
  const wins    = winChecker.check(matrix, bet);
  const scatter = winChecker.checkScatter(matrix, bet);
  const bonus   = !inFreeSpins ? winChecker.checkBonus(matrix) : null;

  winAnimator.clear();

  const multiplier = inFreeSpins ? freeSpinsManager.getMultiplier() : 1;
  let total = 0;

  if (wins.length > 0) {
    const winsTotal = wins.reduce((sum, w) => sum + w.payout, 0) * multiplier;
    total += winsTotal;
    winAnimator.playWins(wins, reels);
    soundManager.playWin(winsTotal / bet);
  }

  if (scatter) {
    total += scatter.payout * multiplier;
    winAnimator.highlightScatters(scatter.positions);
    soundManager.playWin(scatter.payout / bet);
  }

  if (total > 0) {
    balance         += total;
    balanceText.text = `${balance}`;
    winAnimator.celebrateGirls();
    if (inFreeSpins) freeSpinsManager.addWin(total);
  } else {
    soundManager.playNoWin();
  }

  isSpinning = false;
  spinBtn.texture = PIXI.Texture.from('src/Assets/Symbols/Button1.png');

  // ── FREE SPINS FLOW ───────────────────────────────────────
  if (inFreeSpins) {
    const remaining = freeSpinsManager.consumeSpin();
    const delay     = total > 0 ? 1400 : 600;
    if (remaining <= 0) {
      setTimeout(() => {
        soundManager.playFreeSpinComplete();
        freeSpinsManager.end(() => {
          inFreeSpins = false;
          spinContainer.interactive = true;
          spinContainer.alpha       = 1;
        });
      }, delay);
    } else {
      setTimeout(() => _onSpin(), 1000);
    }
    return;
  }

  // ── BONUS TRIGGER (only outside free spins) ───────────────
  if (bonus) {
    winAnimator.highlightBonuses(bonus.positions);
    soundManager.playBonusTrigger();
    spinContainer.interactive = false;
    spinContainer.alpha       = 0.5;
    autoPlaying   = false;   // pause auto-play for free spins
    autoText.text = '';
    autoBtnSprite.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAuto.png');
    setTimeout(() => {
      freeSpinsManager.trigger(() => {
        inFreeSpins = true;
        _onSpin();
      });
    }, 900);
    return;
  }

  // ── NORMAL AUTO-PLAY ──────────────────────────────────────
  if (autoPlaying) {
    autoSpinsLeft--;
    autoText.text = `${autoSpinsLeft}`;
    if (autoSpinsLeft <= 0 || balance < bet) {
      autoPlaying   = false;
      autoText.text = '';
      autoBtnSprite.texture = PIXI.Texture.from('src/Assets/Symbols/ButtonAuto.png');
    } else {
      setTimeout(() => _onSpin(), 600);
    }
  }
}

new LoadingScreen(app, () => {
  new StartScreen(app, () => {
    console.log('ready');
  });
});
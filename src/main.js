// src/main.js
import { buildWeightedPool } from './SymbolMap.js';
import { Reel } from './Reel.js';
import { WinChecker } from './WinChecker.js';
import { WinAnimator } from './WinAnimator.js';
import { SoundManager } from './SoundManager.js';
import { ScaleManager } from './ScaleManager.js';
import { LoadingScreen } from './LoadingScreen.js';
import { StartScreen } from './StartScreen.js';

const APP_WIDTH   = 800;
const APP_HEIGHT  = 600;
const REEL_COUNT  = 5;
const ROW_COUNT   = 3;
const SYMBOL_SIZE = 110;

const app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x0a0a0f,
  antialias: true,
  eventMode: 'dynamic',
});
document.body.appendChild(app.view);

const scaleManager = new ScaleManager(app, APP_WIDTH, APP_HEIGHT);
new LoadingScreen(app, () => {
  new StartScreen(app, (settings) => _initGame(settings));
});

function _initGame(settings) {

  const weightedPool = buildWeightedPool();
  const winChecker   = new WinChecker();
  const soundManager = new SoundManager();

  // Aplicar settings
  soundManager.setEnabled(settings.soundEnabled);
  soundManager.setMusicEnabled(settings.musicEnabled);
soundManager.startMusic();

  let reelsStopped = 0;
  let balance      = 1000;
  let bet          = settings.initialBet;
  let isSpinning   = false;

  // ── RODILLOS ────────────────────────────────────────────
  const reelAreaX = 50;
  const reelAreaY = 60;

  const reels = [];
  for (let i = 0; i < REEL_COUNT; i++) {
    const reel = new Reel(
      app,
      weightedPool,
      reelAreaX + i * (SYMBOL_SIZE + 10),
      reelAreaY,
      SYMBOL_SIZE,
      SYMBOL_SIZE * ROW_COUNT,
      ROW_COUNT
    );
    reels.push(reel);
  }

  const winAnimator = new WinAnimator(app, reelAreaX, reelAreaY);

  // ── PANEL INFERIOR ──────────────────────────────────────
  const panel = new PIXI.Graphics();
  panel.beginFill(0x12122a);
  panel.drawRect(0, APP_HEIGHT - 130, APP_WIDTH, 130);
  panel.endFill();
  app.stage.addChild(panel);

  const line = new PIXI.Graphics();
  line.lineStyle(2, 0x3333aa, 0.8);
  line.moveTo(0, APP_HEIGHT - 130);
  line.lineTo(APP_WIDTH, APP_HEIGHT - 130);
  app.stage.addChild(line);

  // ── ESTILOS DE TEXTO ────────────────────────────────────
  const labelStyle = new PIXI.TextStyle({
    fontFamily:    'Arial',
    fontSize:      13,
    fill:          0x8888bb,
    letterSpacing: 3,
  });

  const valueStyle = new PIXI.TextStyle({
    fontFamily: 'Arial Black',
    fontSize:   22,
    fill:       0xFFFFFF,
    fontWeight: 'bold',
  });

  // ── BALANCE ─────────────────────────────────────────────
  const balanceLabel = new PIXI.Text('BALANCE', labelStyle);
  balanceLabel.x = 60;
  balanceLabel.y = APP_HEIGHT - 115;
  app.stage.addChild(balanceLabel);

  const balanceText = new PIXI.Text(`${balance}`, valueStyle);
  balanceText.x = 60;
  balanceText.y = APP_HEIGHT - 95;
  app.stage.addChild(balanceText);

  // ── BET ─────────────────────────────────────────────────
  const betLabel = new PIXI.Text('BET', labelStyle);
  betLabel.x = 60;
  betLabel.y = APP_HEIGHT - 60;
  app.stage.addChild(betLabel);

  const betText = new PIXI.Text(`${bet}`, valueStyle);
  betText.x = 60;
  betText.y = APP_HEIGHT - 42;
  app.stage.addChild(betText);

  // ── WIN ─────────────────────────────────────────────────
  const winLabel = new PIXI.Text('WIN', labelStyle);
  winLabel.x = 220;
  winLabel.y = APP_HEIGHT - 115;
  app.stage.addChild(winLabel);

  const winText = new PIXI.Text('0', valueStyle);
  winText.x = 220;
  winText.y = APP_HEIGHT - 95;
  app.stage.addChild(winText);

  // ── BOTONES DE APUESTA ───────────────────────────────────
  function makeTextButton(label, x, y, onClick) {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    container.interactive = true;
    container.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    bg.beginFill(0x1e1e3f);
    bg.lineStyle(1, 0x5555cc);
    bg.drawRoundedRect(0, 0, 40, 28, 6);
    bg.endFill();
    container.addChild(bg);

    const txt = new PIXI.Text(label, {
      fontFamily: 'Arial Black',
      fontSize:   14,
      fill:       0xaaaaff,
    });
    txt.anchor.set(0.5);
    txt.x = 20;
    txt.y = 14;
    container.addChild(txt);

    container.on('pointerdown', onClick);
    container.on('pointerover', () => { bg.tint = 0xaaaaff; });
    container.on('pointerout',  () => { bg.tint = 0xFFFFFF; });

    app.stage.addChild(container);
    return container;
  }

  makeTextButton('-', 155, APP_HEIGHT - 50, () => {
    if (bet > 1) { bet = Math.max(1, bet - 5); betText.text = `${bet}`; }
  });

  makeTextButton('+', 200, APP_HEIGHT - 50, () => {
    if (bet < balance) { bet = Math.min(balance, bet + 5); betText.text = `${bet}`; }
  });

  // ── BOTÓN SPIN ───────────────────────────────────────────
  const spinContainer = new PIXI.Container();
  spinContainer.x = APP_WIDTH / 2 - 70;
  spinContainer.y = APP_HEIGHT - 110;
  spinContainer.interactive = true;
  spinContainer.cursor = 'pointer';

  const spinBg = new PIXI.Graphics();
  _drawSpinBtn(spinBg, false);
  spinContainer.addChild(spinBg);

  const spinTxt = new PIXI.Text('SPIN', {
    fontFamily:    'Arial Black',
    fontSize:      26,
    fill:          0x0a0a0f,
    fontWeight:    'bold',
    letterSpacing: 4,
  });
  spinTxt.anchor.set(0.5);
  spinTxt.x = 70;
  spinTxt.y = 45;
  spinContainer.addChild(spinTxt);

  spinContainer.on('pointerdown', _onSpin);
  spinContainer.on('pointerover', () => {
    if (!isSpinning) { spinBg.tint = 0xddaa00; }
  });
  spinContainer.on('pointerout', () => { spinBg.tint = 0xFFFFFF; });

  app.stage.addChild(spinContainer);

  function _drawSpinBtn(g, disabled) {
    g.clear();
    g.beginFill(disabled ? 0x555555 : 0xFFD700);
    g.drawRoundedRect(0, 0, 140, 90, 16);
    g.endFill();
  }

  // ── LÓGICA SPIN ──────────────────────────────────────────
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
  }
}
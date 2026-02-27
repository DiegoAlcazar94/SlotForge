// src/WinAnimator.js

const HIGHLIGHT_COLOR  = 0xFFD700;
const SYMBOL_SIZE      = 110;
const REEL_SPACING     = 10;

export class WinAnimator {
  constructor(app, reelAreaX, reelAreaY) {
    this.app        = app;
    this.reelAreaX  = reelAreaX;
    this.reelAreaY  = reelAreaY;

    // Contenedor para todas las líneas y efectos (siempre encima)
    this.overlayContainer = new PIXI.Container();
    app.stage.addChild(this.overlayContainer);

    this._pulseTargets = []; // símbolos que están parpadeando
    this._pulseTimer   = 0;
    this._pulsing      = false;

    app.ticker.add(() => this._update());
  }

  // Recibe el array de wins del WinChecker y los reels para acceder a los símbolos
  playWins(wins, reels) {
    this.clear();

    if (wins.length === 0) return;

    for (const win of wins) {
      this._drawPayline(win.payline);
      this._highlightSymbols(win.payline, reels, win.matchCount);
    }

    this._pulsing = true;
  }

  clear() {
    this.overlayContainer.removeChildren();
    this._pulseTargets = [];
    this._pulsing      = false;

    // Restaurar alpha de todos los símbolos que pudieran quedar a medio animar
    for (const target of this._pulseTargets) {
      if (target && !target.destroyed) target.alpha = 1;
    }
  }

  _drawPayline(payline) {
    const line = new PIXI.Graphics();
    line.lineStyle(3, HIGHLIGHT_COLOR, 0.9);

    payline.forEach((rowIndex, reelIndex) => {
      const x = this.reelAreaX + reelIndex * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const y = this.reelAreaY + rowIndex * SYMBOL_SIZE + SYMBOL_SIZE / 2;

      if (reelIndex === 0) {
        line.moveTo(x, y);
      } else {
        line.lineTo(x, y);
      }
    });

    // Círculos en cada punto de la línea
    payline.forEach((rowIndex, reelIndex) => {
      const x = this.reelAreaX + reelIndex * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const y = this.reelAreaY + rowIndex * SYMBOL_SIZE + SYMBOL_SIZE / 2;
      line.beginFill(HIGHLIGHT_COLOR, 0.3);
      line.drawCircle(x, y, 18);
      line.endFill();
    });

    this.overlayContainer.addChild(line);
  }

  _highlightSymbols(payline, reels, matchCount) {
    // Solo resaltar los símbolos que forman la combinación ganadora
    for (let i = 0; i < matchCount; i++) {
      const rowIndex = payline[i];
      const reel     = reels[i];
      const symbol   = reel.getSymbolAt(rowIndex);
      if (symbol) this._pulseTargets.push(symbol);
    }
  }

  _update() {
    if (!this._pulsing || this._pulseTargets.length === 0) return;

    this._pulseTimer += 0.08;

    // Oscilación de alpha usando seno para efecto suave
    const alpha = 0.4 + Math.abs(Math.sin(this._pulseTimer)) * 0.6;

    for (const sym of this._pulseTargets) {
      if (sym && !sym.destroyed) sym.alpha = alpha;
    }
  }
}
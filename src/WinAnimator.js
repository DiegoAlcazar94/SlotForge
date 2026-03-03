// src/WinAnimator.js

const HIGHLIGHT_COLOR = 0xFFD700;
const SYMBOL_SIZE     = 110;
const REEL_SPACING    = 10;

export class WinAnimator {
  constructor(app, reelAreaX, reelAreaY) {
    this.app       = app;
    this.reelAreaX = reelAreaX;
    this.reelAreaY = reelAreaY;

    this.overlayContainer = new PIXI.Container();
    app.stage.addChild(this.overlayContainer);

    this._pulseTargets = [];
    this._particles    = [];
    this._pulseTimer   = 0;
    this._pulsing      = false;

    app.ticker.add(() => this._update());
  }

  playWins(wins, reels) {
    this.clear();
    if (wins.length === 0) return;

    this._flashScreen();

    for (const win of wins) {
      this._drawPayline(win.payline);
      this._highlightSymbols(win.payline, reels, win.matchCount);
      this._spawnParticles(win.payline, win.matchCount);
    }

    this._pulsing = true;
  }

  clear() {
    for (const t of this._pulseTargets) {
      if (t && !t.destroyed) {
        t.alpha = 1;
        t.scale.set(1);
      }
    }
    this.overlayContainer.removeChildren();
    this._pulseTargets = [];
    this._particles    = [];
    this._pulseTimer   = 0;
    this._pulsing      = false;
  }

  // ── Flash de pantalla al ganar ────────────────────────
  _flashScreen() {
    const flash = new PIXI.Graphics();
    flash.beginFill(0xFFD700, 0.25);
    flash.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    flash.endFill();
    this.overlayContainer.addChild(flash);

    let alpha = 0.25;
    const fade = this.app.ticker.add(() => {
      alpha -= 0.015;
      flash.alpha = Math.max(0, alpha);
      if (alpha <= 0) {
        this.app.ticker.remove(fade);
        if (flash.parent) flash.parent.removeChild(flash);
      }
    });
  }

  // ── Línea de payline ──────────────────────────────────
  _drawPayline(payline) {
    // Resplandor exterior
    const glow = new PIXI.Graphics();
    glow.lineStyle(8, HIGHLIGHT_COLOR, 0.2);
    payline.forEach((rowIndex, reelIndex) => {
      const x = this.reelAreaX + reelIndex * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const y = this.reelAreaY + rowIndex  * SYMBOL_SIZE + SYMBOL_SIZE / 2;
      reelIndex === 0 ? glow.moveTo(x, y) : glow.lineTo(x, y);
    });
    this.overlayContainer.addChild(glow);

    // Línea principal
    const line = new PIXI.Graphics();
    line.lineStyle(3, HIGHLIGHT_COLOR, 0.95);
    payline.forEach((rowIndex, reelIndex) => {
      const x = this.reelAreaX + reelIndex * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const y = this.reelAreaY + rowIndex  * SYMBOL_SIZE + SYMBOL_SIZE / 2;
      reelIndex === 0 ? line.moveTo(x, y) : line.lineTo(x, y);
    });

    // Círculos en cada punto
    payline.forEach((rowIndex, reelIndex) => {
      const x = this.reelAreaX + reelIndex * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const y = this.reelAreaY + rowIndex  * SYMBOL_SIZE + SYMBOL_SIZE / 2;
      line.beginFill(HIGHLIGHT_COLOR, 0.4);
      line.drawCircle(x, y, 14);
      line.endFill();
    });

    this.overlayContainer.addChild(line);
  }

  // ── Resaltar símbolos ganadores ───────────────────────
  _highlightSymbols(payline, reels, matchCount) {
    for (let i = 0; i < matchCount; i++) {
      const symbol = reels[i].getSymbolAt(payline[i]);
      if (symbol) {
        // Marco dorado alrededor del símbolo ganador
        const frame = new PIXI.Graphics();
        frame.lineStyle(4, HIGHLIGHT_COLOR, 1);
        frame.drawRoundedRect(
          this.reelAreaX + i * (SYMBOL_SIZE + REEL_SPACING) + 2,
          this.reelAreaY + payline[i] * SYMBOL_SIZE + 2,
          SYMBOL_SIZE - 4,
          SYMBOL_SIZE - 4,
          10
        );
        this.overlayContainer.addChild(frame);
        this._pulseTargets.push(symbol);
      }
    }
  }

  // ── Partículas en los símbolos ganadores ──────────────
  _spawnParticles(payline, matchCount) {
    for (let i = 0; i < matchCount; i++) {
      const cx = this.reelAreaX + i * (SYMBOL_SIZE + REEL_SPACING) + SYMBOL_SIZE / 2;
      const cy = this.reelAreaY + payline[i] * SYMBOL_SIZE + SYMBOL_SIZE / 2;

      for (let p = 0; p < 10; p++) {
        const particle = new PIXI.Graphics();
        const color    = Math.random() > 0.5 ? 0xFFD700 : 0xFF6600;
        const size     = Math.random() * 5 + 2;
        particle.beginFill(color, 0.9);
        particle.drawCircle(0, 0, size);
        particle.endFill();
        particle.x = cx;
        particle.y = cy;

        const angle  = Math.random() * Math.PI * 2;
        const speed  = Math.random() * 4 + 2;
        particle._vx = Math.cos(angle) * speed;
        particle._vy = Math.sin(angle) * speed - 3;
        particle._life = 1;

        this.overlayContainer.addChild(particle);
        this._particles.push(particle);
      }
    }
  }

  // ── Update loop ───────────────────────────────────────
  _update() {
    if (!this._pulsing) return;

    this._pulseTimer += 0.08;

    // Pulso de los símbolos ganadores
    const alpha = 0.5 + Math.abs(Math.sin(this._pulseTimer)) * 0.5;
    const scale = 1 + Math.sin(this._pulseTimer * 1.2) * 0.05;

    for (const sym of this._pulseTargets) {
      if (sym && !sym.destroyed) {
        sym.alpha = alpha;
        sym.scale.set(scale);
      }
    }

    // Actualizar partículas
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p  = this._particles[i];
      p._vy   += 0.2; // gravedad
      p.x     += p._vx;
      p.y     += p._vy;
      p._life -= 0.025;
      p.alpha  = Math.max(0, p._life);

      if (p._life <= 0) {
        if (p.parent) p.parent.removeChild(p);
        this._particles.splice(i, 1);
      }
    }
  }
}
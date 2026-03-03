// src/WinAnimator.js

const HIGHLIGHT_COLOR = 0xFFD700;

export class WinAnimator {
  constructor(app, reelAreaX, reelAreaY, symbolSize = 83, reelSpacing = 5) {
    this.app         = app;
    this.reelAreaX   = reelAreaX;
    this.reelAreaY   = reelAreaY;
    this.symbolSize  = symbolSize;
    this.reelSpacing = reelSpacing;

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
      if (t && !t.destroyed) { t.alpha = 1; t.scale.set(1); }
    }
    this.overlayContainer.removeChildren();
    this._pulseTargets = [];
    this._particles    = [];
    this._pulseTimer   = 0;
    this._pulsing      = false;
  }

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

  _cx(reelIndex) {
    return this.reelAreaX + reelIndex * (this.symbolSize + this.reelSpacing) + this.symbolSize / 2;
  }

  _cy(rowIndex) {
    return this.reelAreaY + rowIndex * this.symbolSize + this.symbolSize / 2;
  }

  _drawPayline(payline) {
    const glow = new PIXI.Graphics();
    glow.lineStyle(8, HIGHLIGHT_COLOR, 0.2);
    payline.forEach((row, reel) => {
      reel === 0 ? glow.moveTo(this._cx(reel), this._cy(row)) : glow.lineTo(this._cx(reel), this._cy(row));
    });
    this.overlayContainer.addChild(glow);

    const line = new PIXI.Graphics();
    line.lineStyle(3, HIGHLIGHT_COLOR, 0.95);
    payline.forEach((row, reel) => {
      reel === 0 ? line.moveTo(this._cx(reel), this._cy(row)) : line.lineTo(this._cx(reel), this._cy(row));
    });
    payline.forEach((row, reel) => {
      line.beginFill(HIGHLIGHT_COLOR, 0.4);
      line.drawCircle(this._cx(reel), this._cy(row), 10);
      line.endFill();
    });
    this.overlayContainer.addChild(line);
  }

  _highlightSymbols(payline, reels, matchCount) {
    const sz = this.symbolSize;
    for (let i = 0; i < matchCount; i++) {
      const symbol = reels[i].getSymbolAt(payline[i]);
      if (symbol) {
        const frame = new PIXI.Graphics();
        frame.lineStyle(4, HIGHLIGHT_COLOR, 1);
        frame.drawRoundedRect(
          this.reelAreaX + i * (sz + this.reelSpacing) + 2,
          this.reelAreaY + payline[i] * sz + 2,
          sz - 4, sz - 4, 8
        );
        this.overlayContainer.addChild(frame);
        this._pulseTargets.push(symbol);
      }
    }
  }

  _spawnParticles(payline, matchCount) {
    for (let i = 0; i < matchCount; i++) {
      const cx = this._cx(i);
      const cy = this._cy(payline[i]);
      for (let p = 0; p < 10; p++) {
        const particle = new PIXI.Graphics();
        const color    = Math.random() > 0.5 ? 0xFFD700 : 0xFF6600;
        particle.beginFill(color, 0.9);
        particle.drawCircle(0, 0, Math.random() * 5 + 2);
        particle.endFill();
        particle.x    = cx;
        particle.y    = cy;
        const angle   = Math.random() * Math.PI * 2;
        const speed   = Math.random() * 4 + 2;
        particle._vx  = Math.cos(angle) * speed;
        particle._vy  = Math.sin(angle) * speed - 3;
        particle._life = 1;
        this.overlayContainer.addChild(particle);
        this._particles.push(particle);
      }
    }
  }

  _update() {
    if (!this._pulsing) return;
    this._pulseTimer += 0.08;
    const alpha = 0.5 + Math.abs(Math.sin(this._pulseTimer)) * 0.5;
    const scale = 1 + Math.sin(this._pulseTimer * 1.2) * 0.05;
    for (const sym of this._pulseTargets) {
      if (sym && !sym.destroyed) { sym.alpha = alpha; sym.scale.set(scale); }
    }
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p._vy += 0.2; p.x += p._vx; p.y += p._vy;
      p._life -= 0.025; p.alpha = Math.max(0, p._life);
      if (p._life <= 0) {
        if (p.parent) p.parent.removeChild(p);
        this._particles.splice(i, 1);
      }
    }
  }
}
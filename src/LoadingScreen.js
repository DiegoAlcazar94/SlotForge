// src/LoadingScreen.js

export class LoadingScreen {
  constructor(app, onComplete) {
    this.app        = app;
    this.onComplete = onComplete;
    this._progress  = 0;
    this._timer     = 0;
    this._completing = false;

    // Contenedor encima de todo
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);

    this._buildBackground();
    this._buildLogo();
    this._buildProgressBar();
    this._buildParticles();

    this._updateFn = (delta) => this._update(delta);
    app.ticker.add(this._updateFn);
  }

  _buildBackground() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a0a0f);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    this.container.addChild(bg);

    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1a1a4a, 0.6);
    for (let x = 0; x < w; x += 40) {
      grid.moveTo(x, 0); grid.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      grid.moveTo(0, y); grid.lineTo(w, y);
    }
    this.container.addChild(grid);
  }

  _buildLogo() {
    const cx = this.app.screen.width  / 2;
    const cy = this.app.screen.height / 2 - 60;

    this._glow = new PIXI.Graphics();
    this.container.addChild(this._glow);

    this._logoText = new PIXI.Text('SLOTFORGE', {
      fontFamily:       'Arial Black',
      fontSize:         72,
      fontWeight:       'bold',
      fill:             [0xFFD700, 0xFF6600],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke:           0xFF9900,
      strokeThickness:  3,
      letterSpacing:    8,
    });
    this._logoText.anchor.set(0.5);
    this._logoText.x     = cx;
    this._logoText.y     = cy;
    this._logoText.alpha = 0;
    this.container.addChild(this._logoText);

    this._subText = new PIXI.Text('LOADING...', {
      fontFamily:    'Arial',
      fontSize:      14,
      fill:          0x8888bb,
      letterSpacing: 6,
    });
    this._subText.anchor.set(0.5);
    this._subText.x     = cx;
    this._subText.y     = cy + 55;
    this._subText.alpha = 0;
    this.container.addChild(this._subText);
  }

  _buildProgressBar() {
    const cx     = this.app.screen.width  / 2;
    const cy     = this.app.screen.height / 2 + 60;
    const width  = 360;
    const height = 6;

    const barBg = new PIXI.Graphics();
    barBg.beginFill(0x1a1a3a);
    barBg.drawRoundedRect(cx - width / 2, cy, width, height, 3);
    barBg.endFill();
    this.container.addChild(barBg);

    this._bar        = new PIXI.Graphics();
    this._bar.x      = cx - width / 2;
    this._bar.y      = cy;
    this._barWidth   = width;
    this._barHeight  = height;
    this.container.addChild(this._bar);

    this._pctText = new PIXI.Text('0%', {
      fontFamily:    'Arial',
      fontSize:      12,
      fill:          0x5555aa,
      letterSpacing: 2,
    });
    this._pctText.anchor.set(0.5);
    this._pctText.x = cx;
    this._pctText.y = cy + 20;
    this.container.addChild(this._pctText);
  }

  _buildParticles() {
    this._particles = [];
    for (let i = 0; i < 24; i++) {
      const p    = new PIXI.Graphics();
      p.beginFill(Math.random() > 0.5 ? 0xFFD700 : 0x8844FF, 0.7);
      p.drawCircle(0, 0, Math.random() * 2 + 1);
      p.endFill();
      p.x      = Math.random() * this.app.screen.width;
      p.y      = Math.random() * this.app.screen.height;
      p.alpha  = Math.random() * 0.5 + 0.1;
      p._speed = Math.random() * 0.4 + 0.1;
      this.container.addChild(p);
      this._particles.push(p);
    }
  }

  _update(delta) {
    this._timer += delta;

    // Fade in del logo
    this._logoText.alpha = Math.min(1, this._logoText.alpha + 0.02 * delta);
    this._subText.alpha  = Math.min(1, this._subText.alpha  + 0.02 * delta);

    // Pulso del resplandor
    const pulse = 0.3 + Math.abs(Math.sin(this._timer * 0.04)) * 0.3;
    this._glow.clear();
    this._glow.beginFill(0xFF9900, pulse * 0.15);
    this._glow.drawEllipse(
      this.app.screen.width  / 2,
      this.app.screen.height / 2 - 60,
      260, 60
    );
    this._glow.endFill();

    // Escala del logo
    const scale = 1 + Math.sin(this._timer * 0.03) * 0.008;
    this._logoText.scale.set(scale);

    // Barra de progreso — 180 frames ~ 3 segundos
    this._progress    = Math.min(1, this._timer / 180);
    this._bar.clear();
    this._bar.beginFill(0xFFD700);
    this._bar.drawRoundedRect(
      0, 0,
      this._barWidth * this._progress,
      this._barHeight,
      3
    );
    this._bar.endFill();
    this._pctText.text = `${Math.floor(this._progress * 100)}%`;

    // Partículas flotantes
    for (const p of this._particles) {
      p.y -= p._speed * delta;
      if (p.y < -10) p.y = this.app.screen.height + 10;
      p.alpha = 0.1 + Math.abs(Math.sin(this._timer * 0.02 + p.x)) * 0.4;
    }

    // Al llegar al 100%
    if (this._progress >= 1 && !this._completing) {
      this._completing   = true;
      this._subText.text = 'READY';
      setTimeout(() => this._fadeOut(), 600);
    }
  }

  _fadeOut() {
  this.app.ticker.remove(this._updateFn);
  this.app.stage.removeChild(this.container);
  this.container.destroy({ children: true });
  this.onComplete();
}
}
// src/LoadingScreen.js

export class LoadingScreen {
  /**
   * @param {PIXI.Application} app
   * @param {Function} onComplete — callback cuando termina la animación
   */
  constructor(app, onComplete) {
    this.app        = app;
    this.onComplete = onComplete;
    this.container  = new PIXI.Container();
    app.stage.addChild(this.container);

    this._buildBackground();
    this._buildLogo();
    this._buildProgressBar();
    this._buildParticles();

    this._progress   = 0;
    this._timer      = 0;
    this._done       = false;

    app.ticker.add((delta) => this._update(delta));
  }

  _buildBackground() {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a0a0f);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.container.addChild(bg);

    // Grid de líneas neón de fondo
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1a1a4a, 0.6);
    for (let x = 0; x < this.app.screen.width; x += 40) {
      grid.moveTo(x, 0);
      grid.lineTo(x, this.app.screen.height);
    }
    for (let y = 0; y < this.app.screen.height; y += 40) {
      grid.moveTo(0, y);
      grid.lineTo(this.app.screen.width, y);
    }
    this.container.addChild(grid);
  }

  _buildLogo() {
    const cx = this.app.screen.width  / 2;
    const cy = this.app.screen.height / 2 - 60;

    // Resplandor detrás del texto
    this._glow = new PIXI.Graphics();
    this.container.addChild(this._glow);

    // Texto principal
    this._logoText = new PIXI.Text('SLOTFORGE', {
      fontFamily: 'Arial Black',
      fontSize:   72,
      fontWeight: 'bold',
      fill:       [0xFFD700, 0xFF6600],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke:     0xFF9900,
      strokeThickness: 3,
      letterSpacing: 8,
    });
    this._logoText.anchor.set(0.5);
    this._logoText.x = cx;
    this._logoText.y = cy;
    this._logoText.alpha = 0;
    this.container.addChild(this._logoText);

    // Subtítulo
    this._subText = new PIXI.Text('LOADING...', {
      fontFamily:    'Arial',
      fontSize:      14,
      fill:          0x8888bb,
      letterSpacing: 6,
    });
    this._subText.anchor.set(0.5);
    this._subText.x = cx;
    this._subText.y = cy + 55;
    this._subText.alpha = 0;
    this.container.addChild(this._subText);
  }

  _buildProgressBar() {
    const cx    = this.app.screen.width  / 2;
    const cy    = this.app.screen.height / 2 + 60;
    const width = 360;
    const height = 6;

    // Fondo de la barra
    const barBg = new PIXI.Graphics();
    barBg.beginFill(0x1a1a3a);
    barBg.drawRoundedRect(cx - width / 2, cy, width, height, 3);
    barBg.endFill();
    this.container.addChild(barBg);

    // Barra de progreso
    this._bar = new PIXI.Graphics();
    this._bar.x = cx - width / 2;
    this._bar.y = cy;
    this._barWidth = width;
    this._barHeight = height;
    this.container.addChild(this._bar);

    // Texto de porcentaje
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
      const p = new PIXI.Graphics();
      p.beginFill(Math.random() > 0.5 ? 0xFFD700 : 0x8844FF, 0.7);
      p.drawCircle(0, 0, Math.random() * 2 + 1);
      p.endFill();
      p.x = Math.random() * this.app.screen.width;
      p.y = Math.random() * this.app.screen.height;
      p.alpha = Math.random() * 0.5 + 0.1;
      p._speed = Math.random() * 0.4 + 0.1;
      this.container.addChild(p);
      this._particles.push(p);
    }
  }

  _update(delta) {
    if (this._done) return;

    this._timer += delta;

    // Fade in del logo
    if (this._logoText.alpha < 1) {
      this._logoText.alpha += 0.02 * delta;
      this._subText.alpha  += 0.02 * delta;
    }

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

    // Escala sutil del logo
    const scale = 1 + Math.sin(this._timer * 0.03) * 0.008;
    this._logoText.scale.set(scale);

    // Progreso de la barra (simula carga en ~3 segundos)
    this._progress = Math.min(1, this._timer / 180);
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

    // Al llegar al 100% esperar un momento y lanzar callback
    if (this._progress >= 1 && !this._completing) {
      this._completing = true;
      this._subText.text = 'READY';

      setTimeout(() => {
        this._fadeOut();
      }, 600);
    }
  }

  _fadeOut() {
    let alpha = 1;
    const fade = this.app.ticker.add(() => {
      alpha -= 0.04;
      this.container.alpha = alpha;
      if (alpha <= 0) {
        this.app.ticker.remove(fade);
        this.container.destroy();
        this._done = true;
        this.onComplete();
      }
    });
  }
}
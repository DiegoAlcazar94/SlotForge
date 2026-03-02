// src/StartScreen.js

export class StartScreen {
  constructor(app, onComplete) {
    this.app        = app;
    this.onComplete = onComplete;
    this._timer     = 0;

    this.container = new PIXI.Container();
    app.stage.addChild(this.container);

    this._buildBackground();
    this._buildLogo();
    this._buildPlayButton();

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
    grid.lineStyle(1, 0x1a1a4a, 0.5);
    for (let x = 0; x < w; x += 40) {
      grid.moveTo(x, 0); grid.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      grid.moveTo(0, y); grid.lineTo(w, y);
    }
    this.container.addChild(grid);
  }

  _buildLogo() {
    const cx = this.app.screen.width / 2;

    this._glow = new PIXI.Graphics();
    this.container.addChild(this._glow);

    this._logoText = new PIXI.Text('SLOTFORGE', {
      fontFamily:       'Arial Black',
      fontSize:         64,
      fontWeight:       'bold',
      fill:             [0xFFD700, 0xFF6600],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke:           0xFF9900,
      strokeThickness:  3,
      letterSpacing:    8,
    });
    this._logoText.anchor.set(0.5);
    this._logoText.x = cx;
    this._logoText.y = 220;
    this.container.addChild(this._logoText);

    const sub = new PIXI.Text('IGAMING DEMO · HTML5 + PIXIJS', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });
    sub.anchor.set(0.5);
    sub.x = cx;
    sub.y = 268;
    this.container.addChild(sub);
  }

  _buildPlayButton() {
    const cx = this.app.screen.width / 2;

    // Mismo patrón exacto que makeTextButton en main.js
    const btn       = new PIXI.Container();
    btn.x           = cx - 100;
    btn.y           = 340;
    btn.interactive = true;
    btn.cursor      = 'pointer';
    this.container.addChild(btn);

    const bg = new PIXI.Graphics();
    bg.beginFill(0xFFD700);
    bg.drawRoundedRect(0, 0, 200, 60, 12);
    bg.endFill();
    btn.addChild(bg); // fondo primero

    const txt = new PIXI.Text('PLAY NOW', {
      fontFamily:    'Arial Black',
      fontSize:      24,
      fill:          0x0a0a0f,
      letterSpacing: 4,
    });
    txt.anchor.set(0.5);
    txt.x = 100;
    txt.y = 30;
    btn.addChild(txt); // texto dentro del mismo btn

    btn.on('pointerdown', () => {
      bg.tint = 0xccaa00;
      this._launch();
    });
    btn.on('pointerover', () => { bg.tint = 0xddaa00; });
    btn.on('pointerout',  () => { bg.tint = 0xFFFFFF; });
  }

  _update(delta) {
    this._timer += delta;

    this._logoText.scale.set(1 + Math.sin(this._timer * 0.03) * 0.006);

    const pulse = 0.15 + Math.abs(Math.sin(this._timer * 0.04)) * 0.2;
    this._glow.clear();
    this._glow.beginFill(0xFF9900, pulse);
    this._glow.drawEllipse(this.app.screen.width / 2, 220, 240, 50);
    this._glow.endFill();
  }

  _launch() {
    this.app.ticker.remove(this._updateFn);
    this.app.stage.removeChild(this.container);
    this.container.destroy({ children: true });
    this.onComplete();
  }
}
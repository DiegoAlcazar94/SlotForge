// src/StartScreen.js

export class StartScreen {
  constructor(app, onComplete) {
    this.app        = app;
    this.onComplete = onComplete;
    this._timer     = 0;

    this._settings = {
      musicEnabled: true,
      soundEnabled: true,
    };

    this.container = new PIXI.Container();
    app.stage.addChild(this.container);

    this._buildBackground();
    this._buildLogo();
    this._buildToggles();
    this._buildPlayButton();

    this._updateFn = (delta) => this._update(delta);
    app.ticker.add(this._updateFn);
  }

  _buildBackground() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Fondo sólido — tapa el juego completamente
    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a0a0f);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    this.container.addChild(bg);

    // Grid neón
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1a1a4a, 0.5);
    for (let x = 0; x < w; x += 40) {
      grid.moveTo(x, 0); grid.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      grid.moveTo(0, y); grid.lineTo(w, y);
    }
    this.container.addChild(grid);

    // Líneas decorativas doradas
    const deco = new PIXI.Graphics();
    deco.lineStyle(1, 0xFFD700, 0.3);
    deco.moveTo(0, 150); deco.lineTo(w, 150);
    deco.moveTo(0, 152); deco.lineTo(w, 152);
    this.container.addChild(deco);
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
    this._logoText.y = 90;
    this.container.addChild(this._logoText);

    const sub = new PIXI.Text('IGAMING DEMO · HTML5 + PIXIJS', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });
    sub.anchor.set(0.5);
    sub.x = cx;
    sub.y = 135;
    this.container.addChild(sub);
  }

  _buildToggles() {
    const cx     = this.app.screen.width / 2;
    const panelY = 175;

    // Panel de settings
    const panel = new PIXI.Graphics();
    panel.beginFill(0x12122a, 0.95);
    panel.lineStyle(1, 0x3333aa);
    panel.drawRoundedRect(cx - 200, panelY, 400, 160, 12);
    panel.endFill();
    this.container.addChild(panel);

    const title = new PIXI.Text('SETTINGS', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });
    title.anchor.set(0.5);
    title.x = cx;
    title.y = panelY + 20;
    this.container.addChild(title);

    // Los dos toggles
    this._musicToggle = this._createToggle(
      'BACKGROUND MUSIC',
      cx - 170, panelY + 55,
      this._settings.musicEnabled,
      (val) => { this._settings.musicEnabled = val; }
    );

    this._soundToggle = this._createToggle(
      'SOUND EFFECTS',
      cx - 170, panelY + 105,
      this._settings.soundEnabled,
      (val) => { this._settings.soundEnabled = val; }
    );
  }

  _createToggle(label, x, y, initialValue, onChange) {
    // Texto de la etiqueta
    const lbl = new PIXI.Text(label, {
      fontFamily:    'Arial',
      fontSize:      13,
      fill:          0xaaaacc,
      letterSpacing: 2,
    });
    lbl.x = x;
    lbl.y = y;
    this.container.addChild(lbl);

    let active = initialValue;

    // Contenedor del toggle — directo al stage container
    const toggle       = new PIXI.Container();
    toggle.x           = x + 240;
    toggle.y           = y - 2;
    toggle.interactive = true;
    toggle.cursor      = 'pointer';
    this.container.addChild(toggle);

    const track = new PIXI.Graphics();
    toggle.addChild(track);

    const thumb = new PIXI.Graphics();
    toggle.addChild(thumb);

    const status = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize:   11,
      fill:       0xaaaacc,
    });
    status.x = 56;
    status.y = 5;
    toggle.addChild(status);

    const draw = () => {
      track.clear();
      track.beginFill(active ? 0x1a3a1a : 0x3a1a1a);
      track.lineStyle(2, active ? 0x44ff44 : 0xff4444);
      track.drawRoundedRect(0, 0, 48, 24, 12);
      track.endFill();

      thumb.clear();
      thumb.beginFill(active ? 0x44ff44 : 0xff4444);
      thumb.drawCircle(active ? 36 : 12, 12, 9);
      thumb.endFill();

      status.text       = active ? 'ON' : 'OFF';
      status.style.fill = active ? 0x44ff44 : 0xff4444;
    };

    draw();

    toggle.on('pointerdown', () => {
      active = !active;
      draw();
      onChange(active);
      toggle.scale.set(0.9);
    });
    toggle.on('pointerup',        () => { toggle.scale.set(1); });
    toggle.on('pointerupoutside', () => { toggle.scale.set(1); });
    toggle.on('pointerover',      () => { toggle.alpha = 0.8; });
    toggle.on('pointerout',       () => { toggle.alpha = 1; toggle.scale.set(1); });

    return toggle;
  }

  _buildPlayButton() {
    const cx = this.app.screen.width / 2;

    const btn       = new PIXI.Container();
    btn.x           = cx - 100;
    btn.y           = 390;
    btn.interactive = true;
    btn.cursor      = 'pointer';
    this.container.addChild(btn);

    const bg = new PIXI.Graphics();
    bg.beginFill(0xFFD700);
    bg.drawRoundedRect(0, 0, 200, 60, 12);
    bg.endFill();
    btn.addChild(bg);

    const txt = new PIXI.Text('PLAY NOW', {
      fontFamily:    'Arial Black',
      fontSize:      24,
      fill:          0x0a0a0f,
      fontWeight:    'bold',
      letterSpacing: 4,
    });
    txt.anchor.set(0.5);
    txt.x = 100;
    txt.y = 30;
    btn.addChild(txt);

    btn.on('pointerdown', () => {
      btn.scale.set(0.95);
      bg.tint = 0xccaa00;
    });
    btn.on('pointerup', () => {
      btn.scale.set(1);
      bg.tint = 0xFFFFFF;
      this._launch();
    });
    btn.on('pointerupoutside', () => {
      btn.scale.set(1);
      bg.tint = 0xFFFFFF;
    });
    btn.on('pointerover', () => { bg.tint = 0xddaa00; });
    btn.on('pointerout',  () => { bg.tint = 0xFFFFFF; btn.scale.set(1); });
  }

  _update(delta) {
    this._timer += delta;

    // Pulso del logo
    const scale = 1 + Math.sin(this._timer * 0.03) * 0.006;
    this._logoText.scale.set(scale);

    // Glow del logo
    const pulse = 0.15 + Math.abs(Math.sin(this._timer * 0.04)) * 0.2;
    this._glow.clear();
    this._glow.beginFill(0xFF9900, pulse);
    this._glow.drawEllipse(
      this.app.screen.width / 2,
      90, 240, 50
    );
    this._glow.endFill();
  }

  _launch() {
    let alpha = 1;
    const fade = this.app.ticker.add(() => {
      alpha -= 0.05;
      this.container.alpha = Math.max(0, alpha);
      if (alpha <= 0) {
        this.app.ticker.remove(fade);
        this.app.ticker.remove(this._updateFn);
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
        this.onComplete(this._settings);
      }
    });
  }
}
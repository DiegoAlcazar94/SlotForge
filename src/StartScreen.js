// src/StartScreen.js

export class StartScreen {
  /**
   * @param {PIXI.Application} app
   * @param {Function} onStart — callback con la config elegida
   */
  constructor(app, onStart) {
    this.app       = app;
    this.onStart   = onStart;
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);

    // Configuración por defecto
    this._settings = {
      musicEnabled:  true,
      soundEnabled:  true,
      initialBet:    10,
    };

    this._showingHelp = false;
    this._timer       = 0;

    this._buildBackground();
    this._buildLogo();
    this._buildSettingsPanel();
    this._buildStartButton();
    this._buildHelpPanel();

    app.ticker.add((delta) => this._update(delta));
  }

  _buildBackground() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a0a0f);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    this.container.addChild(bg);

    // Grid neón de fondo
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1a1a4a, 0.5);
    for (let x = 0; x < w; x += 40) {
      grid.moveTo(x, 0); grid.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      grid.moveTo(0, y); grid.lineTo(w, y);
    }
    this.container.addChild(grid);

    // Líneas decorativas horizontales
    const deco = new PIXI.Graphics();
    deco.lineStyle(1, 0xFFD700, 0.3);
    deco.moveTo(0, 140); deco.lineTo(w, 140);
    deco.moveTo(0, 142); deco.lineTo(w, 142);
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
    this._logoText.y = 80;
    this.container.addChild(this._logoText);

    const sub = new PIXI.Text('IGAMING DEMO · HTML5 + PIXIJS', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });
    sub.anchor.set(0.5);
    sub.x = cx;
    sub.y = 128;
    this.container.addChild(sub);
  }

  _buildSettingsPanel() {
    const cx = this.app.screen.width / 2;
    const panelY = 160;

    // Fondo del panel
    const panel = new PIXI.Graphics();
    panel.beginFill(0x12122a, 0.95);
    panel.lineStyle(1, 0x3333aa);
    panel.drawRoundedRect(cx - 220, panelY, 440, 240, 12);
    panel.endFill();
    this.container.addChild(panel);

    const titleStyle = new PIXI.TextStyle({
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });

    // Título del panel
    const settingsTitle = new PIXI.Text('SETTINGS', titleStyle);
    settingsTitle.anchor.set(0.5);
    settingsTitle.x = cx;
    settingsTitle.y = panelY + 20;
    this.container.addChild(settingsTitle);

    // ── TOGGLE MÚSICA ──────────────────────────────────────
    this._buildToggle(
      'BACKGROUND MUSIC',
      cx - 100, panelY + 55,
      this._settings.musicEnabled,
      (val) => { this._settings.musicEnabled = val; }
    );

    // ── TOGGLE SONIDO ──────────────────────────────────────
    this._buildToggle(
      'SOUND EFFECTS',
      cx - 100, panelY + 105,
      this._settings.soundEnabled,
      (val) => { this._settings.soundEnabled = val; }
    );

    // ── SELECTOR APUESTA INICIAL ───────────────────────────
    this._buildBetSelector(cx, panelY + 160);
  }

  _buildToggle(label, x, y, initialValue, onChange) {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    this.container.addChild(container);

    const lbl = new PIXI.Text(label, {
      fontFamily:    'Arial',
      fontSize:      13,
      fill:          0xaaaacc,
      letterSpacing: 2,
    });
    container.addChild(lbl);

    let active = initialValue;

    const toggle = new PIXI.Container();
    toggle.x = 220;
    toggle.y = -2;
    toggle.interactive = true;
    toggle.cursor = 'pointer';
    container.addChild(toggle);

    const trackBg = new PIXI.Graphics();
    toggle.addChild(trackBg);

    const thumb = new PIXI.Graphics();
    toggle.addChild(thumb);

    const draw = () => {
      trackBg.clear();
      trackBg.beginFill(active ? 0x224422 : 0x221122);
      trackBg.lineStyle(1, active ? 0x44ff44 : 0xff4444, 0.8);
      trackBg.drawRoundedRect(0, 0, 48, 22, 11);
      trackBg.endFill();

      thumb.clear();
      thumb.beginFill(active ? 0x44ff44 : 0xff4444);
      thumb.drawCircle(active ? 36 : 12, 11, 8);
      thumb.endFill();
    };

    draw();

    toggle.on('pointerdown', () => {
      active = !active;
      draw();
      onChange(active);
    });
  }

  _buildBetSelector(cx, y) {
    const label = new PIXI.Text('STARTING BET', {
      fontFamily:    'Arial',
      fontSize:      13,
      fill:          0xaaaacc,
      letterSpacing: 2,
    });
    label.anchor.set(0.5);
    label.x = cx;
    label.y = y;
    this.container.addChild(label);

    const bets    = [5, 10, 25, 50, 100];
    let   current = 1; // índice de 10 por defecto

    const btnW  = 60;
    const gap   = 10;
    const total = bets.length * btnW + (bets.length - 1) * gap;
    const startX = cx - total / 2;

    this._betBtns = [];

    bets.forEach((value, index) => {
      const btn = new PIXI.Container();
      btn.x = startX + index * (btnW + gap);
      btn.y = y + 22;
      btn.interactive = true;
      btn.cursor = 'pointer';
      this.container.addChild(btn);

      const bg = new PIXI.Graphics();
      btn.addChild(bg);

      const txt = new PIXI.Text(`${value}`, {
        fontFamily: 'Arial Black',
        fontSize:   14,
        fill:       0xFFFFFF,
      });
      txt.anchor.set(0.5);
      txt.x = btnW / 2;
      txt.y = 14;
      btn.addChild(txt);

      const draw = (selected) => {
        bg.clear();
        bg.beginFill(selected ? 0xFFD700 : 0x1e1e3f);
        bg.lineStyle(1, selected ? 0xFFD700 : 0x5555cc);
        bg.drawRoundedRect(0, 0, btnW, 28, 6);
        bg.endFill();
        txt.style.fill = selected ? 0x0a0a0f : 0xFFFFFF;
      };

      draw(index === current);
      this._betBtns.push({ draw, index });

      btn.on('pointerdown', () => {
        current = index;
        this._settings.initialBet = value;
        this._betBtns.forEach(b => b.draw(b.index === current));
      });
    });
  }

  _buildStartButton() {
    const cx = this.app.screen.width / 2;

    this._startBtn = new PIXI.Container();
    this._startBtn.x = cx - 100;
    this._startBtn.y = 430;
    this._startBtn.interactive = true;
    this._startBtn.cursor = 'pointer';
    this.container.addChild(this._startBtn);

    this._startBg = new PIXI.Graphics();
    this._startBg.beginFill(0xFFD700);
    this._startBg.drawRoundedRect(0, 0, 200, 56, 12);
    this._startBg.endFill();
    this._startBtn.addChild(this._startBg);

    const txt = new PIXI.Text('PLAY NOW', {
      fontFamily:    'Arial Black',
      fontSize:      22,
      fill:          0x0a0a0f,
      fontWeight:    'bold',
      letterSpacing: 4,
    });
    txt.anchor.set(0.5);
    txt.x = 100;
    txt.y = 28;
    this._startBtn.addChild(txt);

    this._startBtn.on('pointerdown', () => this._launch());
    this._startBtn.on('pointerover', () => { this._startBg.tint = 0xddaa00; });
    this._startBtn.on('pointerout',  () => { this._startBg.tint = 0xFFFFFF; });

    // Botón de ayuda
    const helpBtn = new PIXI.Container();
    helpBtn.x = cx - 30;
    helpBtn.y = 500;
    helpBtn.interactive = true;
    helpBtn.cursor = 'pointer';
    this.container.addChild(helpBtn);

    const helpTxt = new PIXI.Text('HOW TO PLAY  ▸', {
      fontFamily:    'Arial',
      fontSize:      12,
      fill:          0x8888bb,
      letterSpacing: 3,
    });
    helpTxt.anchor.set(0.5);
    helpBtn.addChild(helpTxt);

    helpBtn.on('pointerdown', () => this._toggleHelp());
    helpBtn.on('pointerover', () => { helpTxt.style.fill = 0xFFD700; });
    helpBtn.on('pointerout',  () => { helpTxt.style.fill = 0x8888bb; });
  }

  _buildHelpPanel() {
    const cx = this.app.screen.width / 2;

    this._helpPanel = new PIXI.Container();
    this._helpPanel.alpha = 0;
    this.container.addChild(this._helpPanel);

    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a0a1f, 0.97);
    bg.lineStyle(1, 0x3333aa);
    bg.drawRoundedRect(cx - 220, 150, 440, 280, 12);
    bg.endFill();
    this._helpPanel.addChild(bg);

    const lines = [
      '— Match 3 or more symbols left to right',
      '— 9 paylines active on every spin',
      '— Higher bet = higher payout',
      '',
      'SYMBOL PAYOUTS (x3 / x4 / x5)',
      '7      →  50  /  150  /  500',
      'BAR    →  20  /   60  /  200',
      'BELL   →  10  /   30  /  100',
      'CHERRY →   5  /   15  /   50',
      'LEMON  →   3  /    8  /   25',
    ];

    lines.forEach((line, i) => {
      const t = new PIXI.Text(line, {
        fontFamily: 'Courier New',
        fontSize:   13,
        fill:       line.startsWith('SYMBOL') ? 0xFFD700 : 0xaaaacc,
        letterSpacing: 1,
      });
      t.x = cx - 190;
      t.y = 175 + i * 22;
      this._helpPanel.addChild(t);
    });

    const closeBtn = new PIXI.Text('✕  CLOSE', {
      fontFamily:    'Arial',
      fontSize:      12,
      fill:          0xff4444,
      letterSpacing: 2,
    });
    closeBtn.anchor.set(0.5);
    closeBtn.x = cx;
    closeBtn.y = 408;
    closeBtn.interactive = true;
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => this._toggleHelp());
    this._helpPanel.addChild(closeBtn);
  }

  _toggleHelp() {
    this._showingHelp = !this._showingHelp;
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
      80, 240, 50
    );
    this._glow.endFill();

    // Fade del panel de ayuda
    const targetAlpha   = this._showingHelp ? 1 : 0;
    this._helpPanel.alpha += (targetAlpha - this._helpPanel.alpha) * 0.15;
    this._helpPanel.interactiveChildren = this._showingHelp;
  }

  _launch() {
    let alpha = 1;
    const fade = this.app.ticker.add(() => {
      alpha -= 0.05;
      this.container.alpha = alpha;
      if (alpha <= 0) {
        this.app.ticker.remove(fade);
        this.container.destroy({ children: true });
        this.onStart(this._settings);
      }
    });
  }
}
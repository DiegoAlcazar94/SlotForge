// src/StartScreen.js

export class StartScreen {
  constructor(app, onStart) {
    this.app       = app;
    this.onStart   = onStart;
    this.container = new PIXI.Container();
    this.container.eventMode = 'static';
    this.container.interactiveChildren = true;
    app.stage.addChild(this.container);

    this._settings = {
      musicEnabled: true,
      soundEnabled: true,
      initialBet:   10,
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

    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1a1a4a, 0.5);
    for (let x = 0; x < w; x += 40) {
      grid.moveTo(x, 0); grid.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      grid.moveTo(0, y); grid.lineTo(w, y);
    }
    this.container.addChild(grid);

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
    const cx     = this.app.screen.width / 2;
    const panelY = 160;

    const panel = new PIXI.Graphics();
    panel.beginFill(0x12122a, 0.95);
    panel.lineStyle(1, 0x3333aa);
    panel.drawRoundedRect(cx - 220, panelY, 440, 240, 12);
    panel.endFill();
    this.container.addChild(panel);

    const settingsTitle = new PIXI.Text('SETTINGS', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 4,
    });
    settingsTitle.anchor.set(0.5);
    settingsTitle.x = cx;
    settingsTitle.y = panelY + 20;
    this.container.addChild(settingsTitle);

    this._buildToggle(
      'BACKGROUND MUSIC',
      cx - 190, panelY + 60,
      this._settings.musicEnabled,
      (val) => { this._settings.musicEnabled = val; }
    );

    this._buildToggle(
      'SOUND EFFECTS',
      cx - 190, panelY + 110,
      this._settings.soundEnabled,
      (val) => { this._settings.soundEnabled = val; }
    );

    this._buildBetSelector(cx, panelY + 165);
  }

  _buildToggle(label, x, y, initialValue, onChange) {
  const container = new PIXI.Container();
  container.x = x;
  container.y = y;
  container.eventMode = 'passive';
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
    toggle.x = 260;
    toggle.y = -2;
    toggle.eventMode = 'static';
    toggle.cursor    = 'pointer';
    toggle.hitArea   = new PIXI.Rectangle(0, 0, 80, 28);
    container.addChild(toggle);

    const trackBg = new PIXI.Graphics();
    toggle.addChild(trackBg);

    const thumb = new PIXI.Graphics();
    toggle.addChild(thumb);

    const statusTxt = new PIXI.Text('', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x8888bb,
      letterSpacing: 1,
    });
    statusTxt.x = 56;
    statusTxt.y = 5;
    toggle.addChild(statusTxt);

    const draw = () => {
      trackBg.clear();
      trackBg.beginFill(active ? 0x1a3a1a : 0x3a1a1a);
      trackBg.lineStyle(2, active ? 0x44ff44 : 0xff4444, 1);
      trackBg.drawRoundedRect(0, 0, 48, 24, 12);
      trackBg.endFill();

      thumb.clear();
      thumb.beginFill(active ? 0x44ff44 : 0xff4444);
      thumb.drawCircle(active ? 36 : 12, 12, 9);
      thumb.endFill();

      statusTxt.text       = active ? 'ON' : 'OFF';
      statusTxt.style.fill = active ? 0x44ff44 : 0xff4444;
    };

    draw();

    toggle.on('pointerdown',      () => { toggle.scale.set(0.9); });
    toggle.on('pointerup',        () => {
      toggle.scale.set(1);
      active = !active;
      draw();
      onChange(active);
    });
    toggle.on('pointerupoutside', () => { toggle.scale.set(1); });
    toggle.on('pointerover',      () => { toggle.alpha = 0.8; });
    toggle.on('pointerout',       () => { toggle.alpha = 1; toggle.scale.set(1); });
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
    let   current = 1;
    this._settings.initialBet = bets[current];

    const btnW   = 62;
    const gap    = 8;
    const total  = bets.length * btnW + (bets.length - 1) * gap;
    const startX = cx - total / 2;

    this._betBtns = [];

    bets.forEach((value, index) => {
      const btn = new PIXI.Container();
      btn.x         = startX + index * (btnW + gap);
      btn.y         = y + 24;
      btn.eventMode = 'static';
      btn.cursor    = 'pointer';
      btn.hitArea   = new PIXI.Rectangle(0, 0, btnW, 30);
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
      txt.y = 15;
      btn.addChild(txt);

      const draw = (selected) => {
        bg.clear();
        bg.beginFill(selected ? 0xFFD700 : 0x1e1e3f);
        bg.lineStyle(2, selected ? 0xFFD700 : 0x5555cc);
        bg.drawRoundedRect(0, 0, btnW, 30, 6);
        bg.endFill();
        txt.style.fill = selected ? 0x0a0a0f : 0xFFFFFF;
      };

      draw(index === current);
      this._betBtns.push({ draw, index });

      btn.on('pointerdown', () => { btn.scale.set(0.92); });
      btn.on('pointerup',   () => {
        btn.scale.set(1);
        current = index;
        this._settings.initialBet = value;
        this._betBtns.forEach(b => b.draw(b.index === current));
      });
      btn.on('pointerupoutside', () => { btn.scale.set(1); });
      btn.on('pointerover',      () => { if (index !== current) btn.alpha = 0.75; });
      btn.on('pointerout',       () => { btn.alpha = 1; btn.scale.set(1); });
    });
  }

  _buildStartButton() {
    const cx = this.app.screen.width / 2;

    this._startBtn           = new PIXI.Container();
    this._startBtn.x         = cx - 100;
    this._startBtn.y         = 430;
    this._startBtn.eventMode = 'static';
    this._startBtn.cursor    = 'pointer';
    this._startBtn.hitArea   = new PIXI.Rectangle(0, 0, 200, 56);
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

    this._startBtn.on('pointerdown',      () => {
      this._startBtn.scale.set(0.95);
      this._startBg.tint = 0xccaa00;
    });
    this._startBtn.on('pointerup',        () => {
      this._startBtn.scale.set(1);
      this._startBg.tint = 0xFFFFFF;
      this._launch();
    });
    this._startBtn.on('pointerupoutside', () => {
      this._startBtn.scale.set(1);
      this._startBg.tint = 0xFFFFFF;
    });
    this._startBtn.on('pointerover',      () => { this._startBg.tint = 0xddaa00; });
    this._startBtn.on('pointerout',       () => {
      this._startBg.tint = 0xFFFFFF;
      this._startBtn.scale.set(1);
    });

    // Botón HOW TO PLAY
    const helpBtn           = new PIXI.Container();
    helpBtn.x               = cx - 55;
    helpBtn.y               = 500;
    helpBtn.eventMode       = 'static';
    helpBtn.cursor          = 'pointer';
    helpBtn.hitArea         = new PIXI.Rectangle(-10, -10, 140, 30);
    this.container.addChild(helpBtn);

    const helpTxt = new PIXI.Text('HOW TO PLAY  ▸', {
      fontFamily:    'Arial',
      fontSize:      12,
      fill:          0x8888bb,
      letterSpacing: 3,
    });
    helpBtn.addChild(helpTxt);

    helpBtn.on('pointerdown',      () => { helpBtn.scale.set(0.95); this._toggleHelp(); });
    helpBtn.on('pointerup',        () => { helpBtn.scale.set(1); });
    helpBtn.on('pointerupoutside', () => { helpBtn.scale.set(1); });
    helpBtn.on('pointerover',      () => { helpTxt.style.fill = 0xFFD700; });
    helpBtn.on('pointerout',       () => { helpTxt.style.fill = 0x8888bb; helpBtn.scale.set(1); });
  }

  _buildHelpPanel() {
    const cx = this.app.screen.width / 2;

    this._helpPanel                      = new PIXI.Container();
    this._helpPanel.alpha                = 0;
    this._helpPanel.interactiveChildren  = false;
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
        fontFamily:    'Courier New',
        fontSize:      13,
        fill:          line.startsWith('SYMBOL') ? 0xFFD700 : 0xaaaacc,
        letterSpacing: 1,
      });
      t.x = cx - 190;
      t.y = 175 + i * 22;
      this._helpPanel.addChild(t);
    });

    const closeBtn           = new PIXI.Container();
    closeBtn.x               = cx - 30;
    closeBtn.y               = 408;
    closeBtn.eventMode       = 'static';
    closeBtn.cursor          = 'pointer';
    closeBtn.hitArea         = new PIXI.Rectangle(-20, -10, 100, 30);
    this._helpPanel.addChild(closeBtn);

    const closeTxt = new PIXI.Text('✕  CLOSE', {
      fontFamily:    'Arial',
      fontSize:      12,
      fill:          0xff4444,
      letterSpacing: 2,
    });
    closeBtn.addChild(closeTxt);

    closeBtn.on('pointerdown',      () => { closeBtn.scale.set(0.9); this._toggleHelp(); });
    closeBtn.on('pointerup',        () => { closeBtn.scale.set(1); });
    closeBtn.on('pointerupoutside', () => { closeBtn.scale.set(1); });
    closeBtn.on('pointerover',      () => { closeTxt.style.fill = 0xff8888; });
    closeBtn.on('pointerout',       () => { closeTxt.style.fill = 0xff4444; closeBtn.scale.set(1); });
  }

  _toggleHelp() {
    this._showingHelp = !this._showingHelp;
  }

  _update(delta) {
    this._timer += delta;

    const scale = 1 + Math.sin(this._timer * 0.03) * 0.006;
    this._logoText.scale.set(scale);

    const pulse = 0.15 + Math.abs(Math.sin(this._timer * 0.04)) * 0.2;
    this._glow.clear();
    this._glow.beginFill(0xFF9900, pulse);
    this._glow.drawEllipse(this.app.screen.width / 2, 80, 240, 50);
    this._glow.endFill();

    const targetAlpha = this._showingHelp ? 1 : 0;
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
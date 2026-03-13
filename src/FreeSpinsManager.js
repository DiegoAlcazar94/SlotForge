// src/FreeSpinsManager.js

export class FreeSpinsManager {
  constructor(app, appWidth, appHeight) {
    this.app        = app;
    this.W          = appWidth;
    this.H          = appHeight;

    this.active      = false;
    this.spinsTotal  = 10;
    this.spinsLeft   = 0;
    this.multiplier  = 2;
    this.totalWon    = 0;

    // Full-screen overlay (intro / outro)
    this.overlay = new PIXI.Container();
    this.overlay.visible = false;
    app.stage.addChild(this.overlay);

    // HUD banner shown while free spins are running
    this.hud = new PIXI.Container();
    this.hud.visible = false;
    app.stage.addChild(this.hud);

    this._spinsCountText = null;
    this._buildHUD();
  }

  // ── PUBLIC API ────────────────────────────────────────────

  /** Call when 3+ Bonus symbols detected. Shows intro, then calls onReady(). */
  trigger(onReady) {
    this.active    = true;
    this.spinsLeft = this.spinsTotal;
    this.totalWon  = 0;
    this._updateCounter();
    this._showIntro(onReady);
  }

  /** Call after each free spin resolves. Returns spins remaining. */
  consumeSpin() {
    this.spinsLeft = Math.max(0, this.spinsLeft - 1);
    this._updateCounter();
    return this.spinsLeft;
  }

  /** Accumulate winnings for the outro screen. */
  addWin(amount) {
    this.totalWon += amount;
  }

  isActive()       { return this.active; }
  getMultiplier()  { return this.multiplier; }
  getSpinsLeft()   { return this.spinsLeft; }

  /** Show outro, hide HUD, call onComplete() when done. */
  end(onComplete) {
    this.active      = false;
    this.hud.visible = false;
    this._showOutro(onComplete);
  }

  // ── HUD ───────────────────────────────────────────────────

  _buildHUD() {
    const W = this.W;

    // Background strip at top
    const bg = new PIXI.Graphics();
    bg.beginFill(0x061a06, 0.92);
    bg.lineStyle(2, 0x00ff88, 0.6);
    bg.drawRect(0, 0, W, 54);
    bg.endFill();
    this.hud.addChild(bg);

    // Animated left border glow
    const leftGlow = new PIXI.Graphics();
    leftGlow.beginFill(0x00ff88, 0.3);
    leftGlow.drawRect(0, 0, 4, 54);
    leftGlow.endFill();
    this.hud.addChild(leftGlow);

    const rightGlow = new PIXI.Graphics();
    rightGlow.beginFill(0x00ff88, 0.3);
    rightGlow.drawRect(W - 4, 0, 4, 54);
    rightGlow.endFill();
    this.hud.addChild(rightGlow);

    // Centre label
    const fsLabel = new PIXI.Text('🦕  FREE SPINS', {
      fontFamily: 'Arial Black',
      fontSize:   22,
      fill:       0x00ff88,
      fontWeight: 'bold',
      letterSpacing: 5,
      dropShadow: true,
      dropShadowColor: '#003300',
      dropShadowDistance: 3,
    });
    fsLabel.anchor.set(0.5, 0.5);
    fsLabel.x = W / 2;
    fsLabel.y = 27;
    this.hud.addChild(fsLabel);

    // Left: spins counter
    const spinsLbl = new PIXI.Text('SPINS LEFT', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x88cc88,
      letterSpacing: 2,
    });
    spinsLbl.anchor.set(0, 0.5);
    spinsLbl.x = 30;
    spinsLbl.y = 14;
    this.hud.addChild(spinsLbl);

    this._spinsCountText = new PIXI.Text(`${this.spinsTotal}`, {
      fontFamily: 'Arial Black',
      fontSize:   26,
      fill:       0xFFFFFF,
      fontWeight: 'bold',
    });
    this._spinsCountText.anchor.set(0, 0.5);
    this._spinsCountText.x = 30;
    this._spinsCountText.y = 38;
    this.hud.addChild(this._spinsCountText);

    // Right: multiplier
    const multLbl = new PIXI.Text('MULTIPLIER', {
      fontFamily:    'Arial',
      fontSize:      11,
      fill:          0x88cc88,
      letterSpacing: 2,
    });
    multLbl.anchor.set(1, 0.5);
    multLbl.x = W - 30;
    multLbl.y = 14;
    this.hud.addChild(multLbl);

    const multText = new PIXI.Text(`${this.multiplier}×`, {
      fontFamily: 'Arial Black',
      fontSize:   26,
      fill:       0xFFD700,
      fontWeight: 'bold',
    });
    multText.anchor.set(1, 0.5);
    multText.x = W - 30;
    multText.y = 38;
    this.hud.addChild(multText);

    // Pulse animation on the HUD
    let t = 0;
    this.app.ticker.add(() => {
      if (!this.hud.visible) return;
      t += 0.06;
      const pulse = 0.5 + Math.abs(Math.sin(t)) * 0.5;
      leftGlow.alpha  = 0.15 + pulse * 0.25;
      rightGlow.alpha = 0.15 + pulse * 0.25;
    });
  }

  _updateCounter() {
    if (this._spinsCountText) {
      this._spinsCountText.text = `${this.spinsLeft}`;
    }
  }

  // ── TRANSITION SCREENS ────────────────────────────────────

  _showIntro(onReady) {
    const W = this.W, H = this.H;
    this.overlay.removeChildren();
    this.overlay.visible = true;
    this.overlay.alpha   = 0;

    // Dark backdrop
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.90);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    this.overlay.addChild(bg);

    // Green radial glow behind title
    const glow = new PIXI.Graphics();
    glow.beginFill(0x00ff44, 0.07);
    glow.drawCircle(W / 2, H / 2, 320);
    glow.endFill();
    this.overlay.addChild(glow);

    // Main title
    const title = new PIXI.Text('FREE SPINS!', {
      fontFamily:      'Arial Black',
      fontSize:        76,
      fill:            ['#00ff88', '#00cc44'],
      fillGradientType: 1,
      fontWeight:      'bold',
      dropShadow:      true,
      dropShadowColor: '#001100',
      dropShadowDistance: 8,
      stroke:          '#004422',
      strokeThickness: 8,
      letterSpacing:   4,
    });
    title.anchor.set(0.5);
    title.x = W / 2;
    title.y = H / 2 - 70;
    title.scale.set(0.2);
    this.overlay.addChild(title);

    // Sub-info line
    const sub = new PIXI.Text(`${this.spinsTotal} SPINS   ·   ${this.multiplier}× MULTIPLIER`, {
      fontFamily:    'Arial Black',
      fontSize:      28,
      fill:          0xFFD700,
      letterSpacing: 3,
    });
    sub.anchor.set(0.5);
    sub.x     = W / 2;
    sub.y     = H / 2 + 24;
    sub.alpha = 0;
    this.overlay.addChild(sub);

    // Dino row
    const dino = new PIXI.Text('🦕  🦖  🦕', { fontSize: 48 });
    dino.anchor.set(0.5);
    dino.x     = W / 2;
    dino.y     = H / 2 + 88;
    dino.alpha = 0;
    this.overlay.addChild(dino);

    // Particle decorations
    this._spawnIntroParticles(W, H);

    // Animation loop
    let t = 0;
    const anim = this.app.ticker.add(() => {
      t += 0.04;

      // Fade in overlay
      this.overlay.alpha = Math.min(1, t * 2.5);

      // Title scale bounce
      if (t < 0.7) {
        title.scale.set(0.2 + t * 1.14);
      } else {
        const bounce = 1.0 + Math.sin((t - 0.7) * 8) * Math.exp(-(t - 0.7) * 2) * 0.12;
        title.scale.set(bounce);
      }

      // Sub and dino fade in after title
      if (t > 0.9) {
        sub.alpha  = Math.min(1, (t - 0.9) * 4);
        dino.alpha = Math.min(1, (t - 0.9) * 4);
        dino.y     = H / 2 + 88 - (t - 0.9) * 10;
      }

      // Glow pulse
      glow.alpha = 0.04 + Math.abs(Math.sin(t * 2)) * 0.06;

      // Hold then fade out
      if (t >= 4.0) {
        this.app.ticker.remove(anim);
        this._fadeOut(this.overlay, () => {
          this.overlay.visible = false;
          this.hud.visible     = true;
          onReady();
        });
      }
    });
  }

  _showOutro(onComplete) {
    const W = this.W, H = this.H;
    this.overlay.removeChildren();
    this.overlay.visible = true;
    this.overlay.alpha   = 0;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.90);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    this.overlay.addChild(bg);

    const glow = new PIXI.Graphics();
    glow.beginFill(0xFFD700, 0.06);
    glow.drawCircle(W / 2, H / 2, 300);
    glow.endFill();
    this.overlay.addChild(glow);

    const title = new PIXI.Text('FREE SPINS\nCOMPLETE!', {
      fontFamily:      'Arial Black',
      fontSize:        60,
      fill:            0xFFD700,
      align:           'center',
      fontWeight:      'bold',
      dropShadow:      true,
      dropShadowColor: '#552200',
      dropShadowDistance: 6,
      stroke:          '#443300',
      strokeThickness: 6,
    });
    title.anchor.set(0.5);
    title.x = W / 2;
    title.y = H / 2 - 60;
    this.overlay.addChild(title);

    const wonText = new PIXI.Text(`YOU WON   ${this.totalWon}`, {
      fontFamily:    'Arial Black',
      fontSize:      34,
      fill:          0x00ff88,
      letterSpacing: 2,
    });
    wonText.anchor.set(0.5);
    wonText.x     = W / 2;
    wonText.y     = H / 2 + 48;
    wonText.alpha = 0;
    this.overlay.addChild(wonText);

    let t = 0;
    const anim = this.app.ticker.add(() => {
      t += 0.04;
      this.overlay.alpha = Math.min(1, t * 3);
      if (t > 0.7) wonText.alpha = Math.min(1, (t - 0.7) * 4);
      glow.alpha = 0.03 + Math.abs(Math.sin(t * 2)) * 0.06;

      if (t >= 4.0) {
        this.app.ticker.remove(anim);
        this._fadeOut(this.overlay, () => {
          this.overlay.visible = false;
          onComplete();
        });
      }
    });
  }

  // ── HELPERS ───────────────────────────────────────────────

  _spawnIntroParticles(W, H) {
    const colors = [0x00ff88, 0x00cc44, 0xFFD700, 0xFF6600];
    for (let i = 0; i < 30; i++) {
      const p = new PIXI.Graphics();
      const c = colors[Math.floor(Math.random() * colors.length)];
      p.beginFill(c, 0.8);
      p.drawCircle(0, 0, Math.random() * 5 + 2);
      p.endFill();
      p.x     = Math.random() * W;
      p.y     = Math.random() * H;
      p._vx   = (Math.random() - 0.5) * 3;
      p._vy   = (Math.random() - 0.5) * 3 - 1;
      p._life = Math.random() * 0.5 + 0.5;
      this.overlay.addChild(p);

      const tick = this.app.ticker.add(() => {
        if (!this.overlay.visible) { this.app.ticker.remove(tick); return; }
        p.x     += p._vx;
        p.y     += p._vy;
        p._vy   += 0.05;
        p._life -= 0.008;
        p.alpha  = Math.max(0, p._life);
        if (p._life <= 0) {
          this.app.ticker.remove(tick);
          if (p.parent) p.parent.removeChild(p);
        }
      });
    }
  }

  _fadeOut(container, onComplete) {
    const fade = this.app.ticker.add(() => {
      container.alpha -= 0.045;
      if (container.alpha <= 0) {
        this.app.ticker.remove(fade);
        container.alpha = 0;
        onComplete();
      }
    });
  }
}
// src/BigWinScreen.js

export const WIN_TIERS = [
  { id: 'epic',  label: 'EPIC WIN!',  threshold: 30, color: 0xFF2266, glow: 0xFF0044, textFill: ['#ff2266','#ff88aa'] },
  { id: 'mega',  label: 'MEGA WIN!',  threshold: 15, color: 0xFF6600, glow: 0xFF4400, textFill: ['#ff6600','#ffcc44'] },
  { id: 'big',   label: 'BIG WIN!',   threshold:  5, color: 0xFFD700, glow: 0xFFAA00, textFill: ['#FFD700','#ffffff'] },
];

export class BigWinScreen {
  constructor(app, appWidth, appHeight) {
    this.app = app;
    this.W   = appWidth;
    this.H   = appHeight;

    this.container = new PIXI.Container();
    this.container.visible = false;
    app.stage.addChild(this.container);
  }

  /** Returns which tier applies for (total / bet), or null if none. */
  static getTier(total, bet) {
    const mult = total / bet;
    return WIN_TIERS.find(t => mult >= t.threshold) ?? null;
  }

  /**
   * Show the big-win screen.
   * @param {object} tier     — from WIN_TIERS
   * @param {number} total    — coins to count up to
   * @param {function} onDone — called when animation ends
   */
  show(tier, total, onDone) {
    const W = this.W, H = this.H;
    this.container.removeChildren();
    this.container.visible = true;
    this.container.alpha   = 0;
    this.container.interactive = true; // block clicks underneath

    // ── BACKDROP ──────────────────────────────────────────
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.88);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    this.container.addChild(bg);

    // ── RADIAL GLOW ───────────────────────────────────────
    const glow = new PIXI.Graphics();
    glow.beginFill(tier.glow, 0.1);
    glow.drawCircle(W / 2, H / 2, 380);
    glow.endFill();
    this.container.addChild(glow);

    // ── MAIN WIN LABEL ────────────────────────────────────
    const label = new PIXI.Text(tier.label, {
      fontFamily:       'Arial Black',
      fontSize:         90,
      fill:             tier.textFill,
      fillGradientType: 1,
      fontWeight:       'bold',
      stroke:           '#220011',
      strokeThickness:  10,
      dropShadow:       true,
      dropShadowColor:  '#000000',
      dropShadowDistance: 10,
      letterSpacing:    6,
    });
    label.anchor.set(0.5);
    label.x = W / 2;
    label.y = H / 2 - 60;
    label.scale.set(0.1);
    this.container.addChild(label);

    // ── COIN COUNTER ──────────────────────────────────────
    const counterText = new PIXI.Text('0', {
      fontFamily:   'Arial Black',
      fontSize:     52,
      fill:         0xFFFFFF,
      fontWeight:   'bold',
      dropShadow:   true,
      dropShadowColor: '#000000',
      dropShadowDistance: 5,
    });
    counterText.anchor.set(0.5);
    counterText.x     = W / 2;
    counterText.y     = H / 2 + 58;
    counterText.alpha = 0;
    this.container.addChild(counterText);

    // ── DINO DECORATIONS (tier-specific) ─────────────────
    const dinoRow = tier.id === 'epic'  ? '🦖  🔥  🦖  🔥  🦖'
                  : tier.id === 'mega'  ? '🦕  ⚡  🦕'
                  :                       '🦕  🦕';
    const dino = new PIXI.Text(dinoRow, { fontSize: tier.id === 'epic' ? 42 : 36 });
    dino.anchor.set(0.5);
    dino.x     = W / 2;
    dino.y     = H / 2 + 140;
    dino.alpha = 0;
    this.container.addChild(dino);

    // ── PARTICLE RING ─────────────────────────────────────
    this._spawnRing(tier.color, tier.glow);

    // ── ANIMATION STATE ───────────────────────────────────
    let t           = 0;
    let coinCounted = 0;
    const holdTime  = tier.id === 'epic' ? 5.5 : tier.id === 'mega' ? 4.5 : 3.5;

    const anim = this.app.ticker.add(() => {
      t += 0.04;

      // Fade in
      this.container.alpha = Math.min(1, t * 3);

      // Label scale — punch in then settle
      if (t < 0.6) {
        label.scale.set(0.1 + t * 1.5);
      } else {
        const bounce = 1 + Math.sin((t - 0.6) * 7) * Math.exp(-(t - 0.6) * 2.5) * 0.15;
        label.scale.set(bounce);
      }

      // Continuous subtle pulse on label after settle
      if (t > 1.2) {
        const pulse = 1 + Math.sin(t * 2.5) * 0.03;
        label.scale.set(pulse);
      }

      // Counter fade in + count up
      if (t > 0.8) {
        counterText.alpha = Math.min(1, (t - 0.8) * 5);
        // Speed proportional to win size — faster for larger wins
        const speed = Math.max(1, total / 120);
        coinCounted = Math.min(total, coinCounted + speed);
        counterText.text = `+${Math.floor(coinCounted)}`;

        // Scale pop when coin hits total
        if (coinCounted >= total) {
          counterText.text = `+${total}`;
          const pop = 1 + Math.sin((t - 0.8) * 8) * 0.04;
          counterText.scale.set(pop);
        }
      }

      // Dino row entrance
      if (t > 1.1) {
        dino.alpha = Math.min(1, (t - 1.1) * 4);
        dino.y     = H / 2 + 140 - Math.sin(t * 1.5) * 5;
      }

      // Glow pulse
      glow.alpha = 0.06 + Math.abs(Math.sin(t * 2)) * 0.08;

      // Hold then dismiss
      if (t >= holdTime) {
        this.app.ticker.remove(anim);
        this._dismiss(onDone);
      }
    });

    // Click to skip (after 1.5s)
    setTimeout(() => {
      bg.interactive = true;
      bg.cursor      = 'pointer';
      bg.once('pointerdown', () => {
        this.app.ticker.remove(anim);
        this._dismiss(onDone);
      });
    }, 1500);
  }

  // ── PRIVATE ───────────────────────────────────────────────

  _spawnRing(colorA, colorB) {
    const W = this.W, H = this.H;
    const count  = 40;
    const radius = 280;

    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const p      = new PIXI.Graphics();
      const color  = i % 2 === 0 ? colorA : colorB;
      p.beginFill(color, 0.85);
      p.drawCircle(0, 0, Math.random() * 5 + 2);
      p.endFill();
      p.x     = W / 2 + Math.cos(angle) * radius;
      p.y     = H / 2 + Math.sin(angle) * radius;
      p._base = { x: p.x, y: p.y };
      p._off  = Math.random() * Math.PI * 2;
      this.container.addChild(p);

      const tick = this.app.ticker.add(() => {
        if (!this.container.visible) { this.app.ticker.remove(tick); return; }
        const t2 = performance.now() / 1000;
        p.x = p._base.x + Math.cos(t2 * 1.5 + p._off) * 12;
        p.y = p._base.y + Math.sin(t2 * 1.8 + p._off) * 12;
        p.alpha = 0.4 + Math.abs(Math.sin(t2 * 2 + p._off)) * 0.6;
      });
    }
  }

  _dismiss(onDone) {
    const fade = this.app.ticker.add(() => {
      this.container.alpha -= 0.06;
      if (this.container.alpha <= 0) {
        this.app.ticker.remove(fade);
        this.container.visible      = false;
        this.container.interactive  = false;
        this.container.removeChildren();
        onDone();
      }
    });
  }
}
// src/BigWinScreen.js

export const WIN_TIERS = [
  {
    id:         'super',
    label:      'SUPER WIN!',
    imagePath:  'src/Assets/Symbols/SuperWin.png',
    threshold:  30,
    color:      0xFF2266,
    glow:       0xFF0044,
    particles:  [0xFF2266, 0xFF88AA, 0xFFFFFF],
    holdTime:   5.5,
  },
  {
    id:         'mega',
    label:      'MEGA WIN!',
    imagePath:  'src/Assets/Symbols/MegaWin.png',
    threshold:  15,
    color:      0xFF6600,
    glow:       0xFF4400,
    particles:  [0xFF6600, 0xFFCC44, 0xFFFFFF],
    holdTime:   4.5,
  },
  {
    id:         'big',
    label:      'BIG WIN!',
    imagePath:  'src/Assets/Symbols/BigWin.png',
    threshold:  5,
    color:      0xFFD700,
    glow:       0xFFAA00,
    particles:  [0xFFD700, 0xFFAA00, 0xFFFFFF],
    holdTime:   3.5,
  },
];

export class BigWinScreen {
  constructor(app, appWidth, appHeight) {
    this.app = app;
    this.W   = appWidth;
    this.H   = appHeight;

    this.container = new PIXI.Container();
    this.container.visible     = false;
    this.container.interactive = false;
    app.stage.addChild(this.container);
  }

  // ── PUBLIC ────────────────────────────────────────────────

  static getTier(total, bet) {
    const mult = total / bet;
    return WIN_TIERS.find(t => mult >= t.threshold) ?? null;
  }

  /**
   * @param {object}   tier   — entrada de WIN_TIERS
   * @param {number}   total  — monedas ganadas
   * @param {function} onDone — callback al cerrar
   */
  show(tier, total, onDone) {
    const W = this.W, H = this.H;
    this.container.removeChildren();
    this.container.visible     = true;
    this.container.interactive = true;
    this.container.alpha       = 0;
    this._activeTicker         = null;

    // ── BACKDROP ──────────────────────────────────────────
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.88);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    this.container.addChild(bg);

    // ── GLOW RADIAL ───────────────────────────────────────
    const glow = new PIXI.Graphics();
    glow.beginFill(tier.glow, 0.12);
    glow.drawCircle(W / 2, H / 2, 400);
    glow.endFill();
    this.container.addChild(glow);

    // ── IMAGEN CENTRAL ────────────────────────────────────
    const img    = PIXI.Sprite.from(tier.imagePath);
    img.anchor.set(0.5);
    img.x        = W / 2;
    img.y        = H / 2 - 30;
    img.scale.set(0.05);
    img.alpha    = 0;
    this.container.addChild(img);

    // ── CONTADOR DE MONEDAS ───────────────────────────────
    const counterText = new PIXI.Text('0', {
      fontFamily:         'Arial Black',
      fontSize:           48,
      fill:               0xFFFFFF,
      fontWeight:         'bold',
      dropShadow:         true,
      dropShadowColor:    '#000000',
      dropShadowDistance: 5,
    });
    counterText.anchor.set(0.5);
    counterText.x     = W / 2;
    counterText.y     = H / 2 + 170;
    counterText.alpha = 0;
    this.container.addChild(counterText);

    // ── RING DE PARTÍCULAS ────────────────────────────────
    this._buildRing(tier);

    // ── ANIMACIÓN PRINCIPAL ───────────────────────────────
    let t            = 0;
    let coinCounted  = 0;
    let imgTargetScale = tier.id === 'super' ? 0.80
                       : tier.id === 'mega'  ? 0.75
                       :                       0.70;

    const anim = this.app.ticker.add(() => {
      t += 0.04;

      // Fade in general
      this.container.alpha = Math.min(1, t * 3.5);

      // ── Imagen: punch-in con bounce ────────────────────
      if (t < 0.65) {
        img.alpha = Math.min(1, t * 5);
        img.scale.set(0.05 + t * (imgTargetScale / 0.65));
      } else {
        img.alpha = 1;
        // Bounce elástico
        const elapsed = t - 0.65;
        const bounce  = imgTargetScale
          + Math.sin(elapsed * 9) * Math.exp(-elapsed * 3.5) * 0.12;
        img.scale.set(bounce);
      }

      // Floating suave constante
      if (t > 1.0) {
        img.y = H / 2 - 30 + Math.sin(t * 1.8) * 8;
      }

      // ── Contador: aparece tras la imagen ──────────────
      if (t > 0.9) {
        counterText.alpha = Math.min(1, (t - 0.9) * 5);
        const speed       = Math.max(1, total / 100);
        coinCounted       = Math.min(total, coinCounted + speed);
        counterText.text  = `+${Math.floor(coinCounted)}`;

        if (coinCounted >= total) {
          counterText.text = `+${total}`;
          counterText.scale.set(1 + Math.sin(t * 6) * 0.025);
        }
      }

      // Glow pulsante
      glow.alpha = 0.08 + Math.abs(Math.sin(t * 2.2)) * 0.10;

      // Shake de la imagen en Super Win
      if (tier.id === 'super' && t > 0.8 && t < 2.5) {
        img.x = W / 2 + Math.sin(t * 28) * 3;
      } else {
        img.x = W / 2;
      }

      // Hold → cerrar
      if (t >= tier.holdTime) {
        this.app.ticker.remove(anim);
        this._activeTicker = null;
        this._dismiss(onDone);
      }
    });

    this._activeTicker = anim;

    // Click para saltar (tras 1.5s)
    setTimeout(() => {
      if (!this.container.visible) return;
      bg.interactive = true;
      bg.cursor      = 'pointer';
      bg.once('pointerdown', () => {
        if (this._activeTicker) {
          this.app.ticker.remove(this._activeTicker);
          this._activeTicker = null;
        }
        this._dismiss(onDone);
      });
    }, 1500);
  }

  // ── PRIVATE ───────────────────────────────────────────────

  _buildRing(tier) {
    const W = this.W, H = this.H;
    const COUNT   = 50;
    const RADII   = [240, 310, 370];

    for (let i = 0; i < COUNT; i++) {
      const baseAngle = (i / COUNT) * Math.PI * 2;
      const radius    = RADII[i % RADII.length];
      const color     = tier.particles[i % tier.particles.length];
      const size      = Math.random() * 5 + 2;
      const phaseOff  = Math.random() * Math.PI * 2;
      const speedMult = 0.8 + Math.random() * 0.8;

      const p = new PIXI.Graphics();
      p.beginFill(color, 0.9);
      p.drawCircle(0, 0, size);
      p.endFill();
      p.x      = W / 2 + Math.cos(baseAngle) * radius;
      p.y      = H / 2 + Math.sin(baseAngle) * radius;
      p._base  = { angle: baseAngle, r: radius };
      p._phase = phaseOff;
      p._speed = speedMult;
      this.container.addChild(p);

      const tick = this.app.ticker.add(() => {
        if (!this.container.visible) { this.app.ticker.remove(tick); return; }
        const now    = performance.now() / 1000;
        const angle  = p._base.angle + now * p._speed * 0.4;
        const wobble = p._base.r + Math.sin(now * 2 + p._phase) * 14;
        p.x     = W / 2 + Math.cos(angle) * wobble;
        p.y     = H / 2 + Math.sin(angle) * wobble;
        p.alpha = 0.35 + Math.abs(Math.sin(now * 2.5 + p._phase)) * 0.65;
      });
    }

    // Burst de partículas libres al inicio
    this._burst(tier, W, H);
  }

  _burst(tier, W, H) {
    for (let i = 0; i < 35; i++) {
      const p     = new PIXI.Graphics();
      const color = tier.particles[i % tier.particles.length];
      p.beginFill(color, 0.9);
      p.drawCircle(0, 0, Math.random() * 6 + 2);
      p.endFill();
      p.x     = W / 2 + (Math.random() - 0.5) * 80;
      p.y     = H / 2 + (Math.random() - 0.5) * 80;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      p._vx   = Math.cos(angle) * speed;
      p._vy   = Math.sin(angle) * speed - 4;
      p._life = 1;
      this.container.addChild(p);

      const tick = this.app.ticker.add(() => {
        if (!this.container.visible) { this.app.ticker.remove(tick); return; }
        p._vy   += 0.18;
        p.x     += p._vx;
        p.y     += p._vy;
        p._vx   *= 0.97;
        p._life -= 0.018;
        p.alpha  = Math.max(0, p._life);
        if (p._life <= 0) {
          this.app.ticker.remove(tick);
          if (p.parent) p.parent.removeChild(p);
        }
      });
    }
  }

  _dismiss(onDone) {
    const fade = this.app.ticker.add(() => {
      this.container.alpha -= 0.055;
      if (this.container.alpha <= 0) {
        this.app.ticker.remove(fade);
        this.container.visible     = false;
        this.container.interactive = false;
        this.container.removeChildren();
        onDone();
      }
    });
  }
}
// src/Reel.js
import { getRandomSymbol } from './SymbolMap.js';

const SPIN_DURATION = 180;
const SPIN_SPEED    = 14;   // era 18 — escalado con el nuevo symbolSize (~83/110 * 18)

export class Reel {
  constructor(app, pool, x, y, symbolSize, height, rows) {
    this.app        = app;
    this.pool       = pool;
    this.rows       = rows;
    this.symbolSize = symbolSize;   // ← ahora usa el valor pasado desde main.js
    this.spinning   = false;
    this.frameCount = 0;
    this.onComplete = null;

    this.container   = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    app.stage.addChild(this.container);

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(x, y, symbolSize, height);
    mask.endFill();
    this.container.mask = mask;
    app.stage.addChild(mask);

    this.symbols = [];
    for (let i = 0; i < rows + 1; i++) {
      const sym = this._createSymbol(getRandomSymbol(pool), i);
      this.symbols.push(sym);
    }

    app.ticker.add(() => this._update());
  }

  _createSymbol(data, rowIndex) {
    const sz        = this.symbolSize;
    const container = new PIXI.Container();
    container.y     = rowIndex * sz;
    container.symbolData = data;

    const glow = new PIXI.Graphics();
    glow.beginFill(0xFFD700, 0.08);
    glow.drawRoundedRect(5, 5, sz - 10, sz - 10, 8);
    glow.endFill();
    container.addChild(glow);

    const sprite  = PIXI.Sprite.from(data.path);
    sprite.width  = sz - 6;
    sprite.height = sz - 6;
    sprite.x      = 3;
    sprite.y      = 3;
    container.addChild(sprite);

    this.container.addChild(container);
    return container;
  }

  spin(onComplete = null) {
    if (this.spinning) return;
    this.spinning   = true;
    this.frameCount = 0;
    this.onComplete = onComplete;
  }

  _update() {
    if (!this.spinning) return;

    const sz = this.symbolSize;
    this.frameCount++;

    for (const sym of this.symbols) {
      sym.y += SPIN_SPEED;
    }

    if (this.symbols[0].y > sz) {
      const newData  = getRandomSymbol(this.pool);
      const recycled = this.symbols.pop();
      recycled.destroy({ children: true });

      const topY   = this.symbols[0].y - sz;
      const newSym = this._createSymbol(newData, 0);
      newSym.y     = topY;
      this.symbols.unshift(newSym);
    }

    if (this.frameCount >= SPIN_DURATION) {
      this.spinning = false;
      this._snapToGrid();
      if (this.onComplete) this.onComplete();
    }
  }

  _snapToGrid() {
    const sz = this.symbolSize;
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].y = i * sz;
    }
  }

  getVisibleSymbols() {
    return this.symbols.slice(0, this.rows).map(s => s.symbolData);
  }

  getSymbolAt(rowIndex) {
    return this.symbols[rowIndex] ?? null;
  }
}
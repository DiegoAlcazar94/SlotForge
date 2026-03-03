// src/Reel.js
import { getRandomSymbol } from './SymbolMap.js';

const SYMBOL_SIZE   = 110;
const SPIN_DURATION = 180;
const SPIN_SPEED    = 18;

export class Reel {
  constructor(app, pool, x, y, width, height, rows) {
    this.app        = app;
    this.pool       = pool;
    this.rows       = rows;
    this.spinning   = false;
    this.frameCount = 0;
    this.onComplete = null;

    this.container   = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    app.stage.addChild(this.container);

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(x, y, width, height);
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
    const container = new PIXI.Container();
    container.y     = rowIndex * SYMBOL_SIZE;
    container.symbolData = data;

    // Fondo del símbolo
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.lineStyle(2, 0x444466, 0.8);
    bg.drawRoundedRect(4, 4, SYMBOL_SIZE - 8, SYMBOL_SIZE - 8, 10);
    bg.endFill();
    container.addChild(bg);

    // Sprite de la imagen
    const sprite   = PIXI.Sprite.from(data.path);
    sprite.width   = SYMBOL_SIZE - 16;
    sprite.height  = SYMBOL_SIZE - 16;
    sprite.x       = 8;
    sprite.y       = 8;
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

    this.frameCount++;

    for (const sym of this.symbols) {
      sym.y += SPIN_SPEED;
    }

    if (this.symbols[0].y > SYMBOL_SIZE) {
      const newData  = getRandomSymbol(this.pool);
      const recycled = this.symbols.pop();
      recycled.destroy({ children: true });

      const topY   = this.symbols[0].y - SYMBOL_SIZE;
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
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].y = i * SYMBOL_SIZE;
    }
  }

  getVisibleSymbols() {
    return this.symbols.slice(0, this.rows).map(s => s.symbolData);
  }

  getSymbolAt(rowIndex) {
    return this.symbols[rowIndex] ?? null;
  }
}
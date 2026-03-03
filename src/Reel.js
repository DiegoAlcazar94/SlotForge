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

  // Brillo suave detrás del símbolo en lugar del recuadro azul
  const glow = new PIXI.Graphics();
  glow.beginFill(0xFFD700, 0.08);
  glow.drawRoundedRect(6, 6, SYMBOL_SIZE - 12, SYMBOL_SIZE - 12, 10);
  glow.endFill();
  container.addChild(glow);

  // Sprite de la imagen
  const sprite  = PIXI.Sprite.from(data.path);
  sprite.width  = SYMBOL_SIZE - 8;
  sprite.height = SYMBOL_SIZE - 8;
  sprite.x      = 4;
  sprite.y      = 4;
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
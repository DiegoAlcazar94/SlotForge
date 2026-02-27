// src/Reel.js
import { getRandomSymbol } from './SymbolMap.js';

const SYMBOL_SIZE = 110;
const SPIN_DURATION = 60; // frames
const SPIN_SPEED = 28;    // píxeles por frame

export class Reel {
  constructor(app, pool, x, y, width, height, rows) {
    this.app      = app;
    this.pool     = pool;
    this.rows     = rows;
    this.spinning = false;
    this.frameCount = 0;

    // Contenedor del rodillo
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    app.stage.addChild(this.container);

    // Máscara para que los símbolos no se vean fuera del área
    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(x, y, width, height);
    mask.endFill();
    this.container.mask = mask;
    app.stage.addChild(mask);

    // Crear los símbolos iniciales (rows + 1 extra para la animación)
    this.symbols = [];
    for (let i = 0; i < rows + 1; i++) {
      const sym = this._createSymbol(getRandomSymbol(pool), i);
      this.symbols.push(sym);
    }

    // Loop de animación
    app.ticker.add(() => this._update());
  }

  _createSymbol(data, rowIndex) {
    const container = new PIXI.Container();
    container.y = rowIndex * SYMBOL_SIZE;

    // Fondo del símbolo
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.lineStyle(2, data.color, 0.6);
    bg.drawRoundedRect(4, 4, SYMBOL_SIZE - 8, SYMBOL_SIZE - 8, 12);
    bg.endFill();
    container.addChild(bg);

    // Texto del símbolo (sustituirás esto por sprites cuando tengas assets)
    const text = new PIXI.Text(data.label, {
      fontFamily: 'Arial Black',
      fontSize: 36,
      fontWeight: 'bold',
      fill: data.color,
      align: 'center',
    });
    text.anchor.set(0.5);
    text.x = SYMBOL_SIZE / 2;
    text.y = SYMBOL_SIZE / 2;
    container.addChild(text);

    container.symbolData = data;
    this.container.addChild(container);
    return container;
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.frameCount = 0;
  }

  _update() {
    if (!this.spinning) return;

    this.frameCount++;

    // Mover todos los símbolos hacia abajo
    for (const sym of this.symbols) {
      sym.y += SPIN_SPEED;
    }

    // Si el primer símbolo sale del área, reciclarlo arriba con nuevo símbolo
    if (this.symbols[0].y >= SYMBOL_SIZE) {
      const recycled = this.symbols.shift();
      recycled.y = this.symbols[0].y - SYMBOL_SIZE;

      const newData = getRandomSymbol(this.pool);
      recycled.destroy();
      const newSym = this._createSymbol(newData, 0);
      newSym.y = recycled.y;
      this.symbols.unshift(newSym);
    }

    // Parar después de SPIN_DURATION frames
    if (this.frameCount >= SPIN_DURATION) {
      this.spinning = false;
      this._snapToGrid();
    }
  }

  _snapToGrid() {
    // Alinear los símbolos exactamente a la cuadrícula
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].y = i * SYMBOL_SIZE;
    }
  }

  // Devuelve los símbolos visibles (para el WinChecker)
  getVisibleSymbols() {
    return this.symbols.slice(0, this.rows).map(s => s.symbolData);
  }
}
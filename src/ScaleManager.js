// src/ScaleManager.js

export class ScaleManager {
  /**
   * @param {PIXI.Application} app
   * @param {number} designWidth  — ancho original del diseño (800)
   * @param {number} designHeight — alto original del diseño (600)
   */
  constructor(app, designWidth, designHeight) {
    this.app          = app;
    this.designWidth  = designWidth;
    this.designHeight = designHeight;

    // El canvas ocupa todo el viewport
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.left     = '0';
    app.renderer.view.style.top      = '0';

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Escala que mantiene proporciones y cabe en pantalla
    const scale = Math.min(
      screenW / this.designWidth,
      screenH / this.designHeight
    );

    const newW = Math.floor(this.designWidth  * scale);
    const newH = Math.floor(this.designHeight * scale);

    // Centrar en pantalla
    const offsetX = Math.floor((screenW - newW) / 2);
    const offsetY = Math.floor((screenH - newH) / 2);

    const view = this.app.renderer.view;
    view.style.width  = `${newW}px`;
    view.style.height = `${newH}px`;
    view.style.left   = `${offsetX}px`;
    view.style.top    = `${offsetY}px`;
  }
}
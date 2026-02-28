// src/SoundManager.js

export class SoundManager {
  constructor() {
    this._ctx          = null;
    this._enabled      = true;
    this._musicEnabled = true;
    this._musicNodes   = [];
    this._musicPlaying = false;
    this._loopTimeout  = null;
  }

  setEnabled(value) {
    this._enabled = value;
  }

  setMusicEnabled(value) {
    this._musicEnabled = value;
    if (!value) {
      this.stopMusic();
    } else if (!this._musicPlaying) {
      this.startMusic();
    }
  }

  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  // ── EFECTOS DE SONIDO ────────────────────────────────────

  playReelTick() {
    if (!this._enabled) return;

    const ctx  = this._getContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  playReelStop() {
    if (!this._enabled) return;

    const ctx  = this._getContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  playWin(multiplier = 1) {
    if (!this._enabled) return;

    const ctx   = this._getContext();
    const notes = [523, 659, 784, 1047];

    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const startTime = ctx.currentTime + i * 0.1;
      const duration  = 0.2 + multiplier * 0.02;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  playNoWin() {
    if (!this._enabled) return;

    const ctx  = this._getContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  // ── MÚSICA DE FONDO ──────────────────────────────────────

  startMusic() {
    if (!this._musicEnabled || this._musicPlaying) return;
    this._musicPlaying = true;
    this._playMusicLoop();
  }

  stopMusic() {
    this._musicPlaying = false;
    if (this._loopTimeout) {
      clearTimeout(this._loopTimeout);
      this._loopTimeout = null;
    }
    // Desvanece y desconecta todos los nodos activos
    for (const node of this._musicNodes) {
      try {
        node.gain.gain.setValueAtTime(
          node.gain.gain.value,
          this._ctx.currentTime
        );
        node.gain.gain.exponentialRampToValueAtTime(
          0.001,
          this._ctx.currentTime + 0.5
        );
        node.osc.stop(this._ctx.currentTime + 0.5);
      } catch (e) { /* nodo ya parado */ }
    }
    this._musicNodes = [];
  }

  _playMusicLoop() {
    if (!this._musicPlaying) return;

    const ctx      = this._getContext();
    const now      = ctx.currentTime;
    const loopTime = 4; // segundos por ciclo

    // ── BAJO PULSANTE ──────────────────────────────────────
    // Notas del bajo en secuencia (escala menor pentatónica)
    const bassNotes = [55, 55, 65.4, 55, 49, 55];
    const stepTime  = loopTime / bassNotes.length;

    bassNotes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * stepTime);

      const t = now + i * stepTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.8);

      osc.start(t);
      osc.stop(t + stepTime);
      this._musicNodes.push({ osc, gain });
    });

    // ── NOTAS FLOTANTES DE AMBIENTE ───────────────────────
    // Acorde Am7 disperso en el tiempo
    const ambientNotes = [220, 261.6, 329.6, 392, 440];
    ambientNotes.forEach((freq) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Cada nota entra en un momento aleatorio dentro del ciclo
      const startOffset = Math.random() * (loopTime * 0.8);
      const t = now + startOffset;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.018, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + loopTime - startOffset);

      osc.start(t);
      osc.stop(now + loopTime);
      this._musicNodes.push({ osc, gain });
    });

    // ── HI-HAT ELECTRÓNICO ────────────────────────────────
    // Ruido blanco filtrado a tiempos fijos
    const hatTimes = [0, 1, 2, 3];
    hatTimes.forEach((beat) => {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data       = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type            = 'highpass';
      filter.frequency.value = 8000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now + beat);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beat + 0.05);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now + beat);
      source.stop(now + beat + 0.05);
    });

    // Reiniciar el loop justo antes de que termine
    this._loopTimeout = setTimeout(() => {
      this._musicNodes = [];
      this._playMusicLoop();
    }, (loopTime - 0.1) * 1000);
  }
}
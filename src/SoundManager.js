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

  setEnabled(value) { this._enabled = value; }

  setMusicEnabled(value) {
    this._musicEnabled = value;
    if (!value) this.stopMusic();
    else if (!this._musicPlaying) this.startMusic();
  }

  _getContext() {
    if (!this._ctx)
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  }

  // ── EFECTOS ───────────────────────────────────────────────

  playReelTick() {
    if (!this._enabled) return;
    const ctx = this._getContext(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
  }

  playReelStop() {
    if (!this._enabled) return;
    const ctx = this._getContext(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12);
  }

  playWin(multiplier = 1) {
    if (!this._enabled) return;
    const ctx = this._getContext();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const st  = ctx.currentTime + i * 0.1;
      const dur = 0.2 + multiplier * 0.02;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.25, st + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, st + dur);
      osc.start(st); osc.stop(st + dur);
    });
  }

  playNoWin() {
    if (!this._enabled) return;
    const ctx = this._getContext(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  }

  playBonusTrigger() {
    if (!this._enabled) return;
    const ctx = this._getContext();
    [220, 277, 330, 415, 523, 659, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = i < 4 ? 'sawtooth' : 'sine';
      const t  = ctx.currentTime + i * 0.11;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t); osc.stop(t + 0.5);
    });
  }

  playFreeSpinComplete() {
    if (!this._enabled) return;
    const ctx = this._getContext();
    [523, 659, 784, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const t  = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.4);
    });
  }

  // ── BIG WIN SOUNDS ────────────────────────────────────────

  playBigWin() {
    if (!this._enabled) return;
    const ctx = this._getContext();
    [587, 659, 740, 880, 1047].forEach((f, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const st = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.28, st + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.42);
      osc.start(st); osc.stop(st + 0.45);
    });
  }

  playMegaWin() {
    if (!this._enabled) return;
    const ctx = this._getContext();
    [440, 554, 659, 880, 1108, 1318].forEach((f, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = i < 3 ? 'sawtooth' : 'sine';
      const st = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.26, st + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.55);
      osc.start(st); osc.stop(st + 0.6);
    });
  }

  playSuperWin() {
    if (!this._enabled) return;
    const ctx   = this._getContext();
    const wave1 = [330, 415, 523, 659, 830];
    const wave2 = [659, 784, 988, 1244, 1568];
    [...wave1, ...wave2].forEach((f, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = i < 5 ? 'sawtooth' : 'sine';
      const st = ctx.currentTime + i * 0.11;
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.24, st + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
      osc.start(st); osc.stop(st + 0.65);
    });
  }

  // ── MÚSICA DE FONDO ───────────────────────────────────────

  startMusic() {
    if (!this._musicEnabled || this._musicPlaying) return;
    this._musicPlaying = true;
    this._playMusicLoop();
  }

  stopMusic() {
    this._musicPlaying = false;
    if (this._loopTimeout) { clearTimeout(this._loopTimeout); this._loopTimeout = null; }
    for (const node of this._musicNodes) {
      try {
        node.gain.gain.setValueAtTime(node.gain.gain.value, this._ctx.currentTime);
        node.gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.5);
        node.osc.stop(this._ctx.currentTime + 0.5);
      } catch (e) {}
    }
    this._musicNodes = [];
  }

  _playMusicLoop() {
    if (!this._musicPlaying) return;
    const ctx      = this._getContext();
    const now      = ctx.currentTime;
    const loopTime = 4;

    const bassNotes = [55, 55, 65.4, 55, 49, 55];
    const stepTime  = loopTime / bassNotes.length;
    bassNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * stepTime);
      const t = now + i * stepTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.8);
      osc.start(t); osc.stop(t + stepTime);
      this._musicNodes.push({ osc, gain });
    });

    [220, 261.6, 329.6, 392, 440].forEach(freq => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const startOffset = Math.random() * (loopTime * 0.8);
      const t = now + startOffset;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.018, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + loopTime - startOffset);
      osc.start(t); osc.stop(now + loopTime);
      this._musicNodes.push({ osc, gain });
    });

    [0, 1, 2, 3].forEach(beat => {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data       = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 8000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now + beat);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beat + 0.05);
      source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      source.start(now + beat); source.stop(now + beat + 0.05);
    });

    this._loopTimeout = setTimeout(() => {
      this._musicNodes = [];
      this._playMusicLoop();
    }, (loopTime - 0.1) * 1000);
  }
}
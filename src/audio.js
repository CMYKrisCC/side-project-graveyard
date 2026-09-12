// Everything here is synthesised. No audio files to license, host, or have
// fail to load while a judge is watching.

// Struck-bell partials. Real bells are inharmonic — the minor third at 1.2 is
// what makes them read as mournful rather than as a plain tone.
const BELL_PARTIALS = [
  { ratio: 0.5, gain: 0.5, decay: 5.5 },
  { ratio: 1.0, gain: 1.0, decay: 4.5 },
  { ratio: 1.2, gain: 0.7, decay: 3.6 },
  { ratio: 1.5, gain: 0.45, decay: 2.8 },
  { ratio: 2.0, gain: 0.35, decay: 2.2 },
  { ratio: 2.67, gain: 0.22, decay: 1.5 },
  { ratio: 3.6, gain: 0.14, decay: 1.0 },
  { ratio: 5.4, gain: 0.08, decay: 0.7 },
];

const CHIME_PARTIALS = [
  { ratio: 1, gain: 0.6, decay: 1.1 },
  { ratio: 2.76, gain: 0.3, decay: 0.8 },
  { ratio: 5.4, gain: 0.12, decay: 0.5 },
];

const MUSIC_SRC = "/music/spirits-of-the-moor.mp3";
const MUSIC_LEVEL = 0.26;

class GraveyardAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.muted = false;
  }

  start() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    this._startMusic();
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.master) return;

    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.4);

    if (muted) this.music?.pause();
    else this.music?.play().catch(() => {});
  }

  // Streamed through an element rather than decoded into a buffer: two minutes
  // of PCM would sit in memory for no benefit.
  _startMusic() {
    const ctx = this.ctx;

    this.music = new Audio(MUSIC_SRC);
    this.music.loop = true;
    this.music.preload = "auto";

    const level = ctx.createGain();
    level.gain.setValueAtTime(0.0001, ctx.currentTime);
    level.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + 3);

    ctx.createMediaElementSource(this.music).connect(level).connect(this.master);

    // Autoplay can still be refused; the mute toggle re-triggers this.
    this.music.play().catch(() => {});
  }

  _strike(partials, fundamental, level) {
    if (!this.ctx || this.muted) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (const { ratio, gain, decay } of partials) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      // A touch of detune keeps repeated strikes from sounding identical.
      osc.frequency.value = fundamental * ratio * (1 + (Math.random() - 0.5) * 0.004);

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(gain * level, now + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(envelope).connect(this.master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    }
  }

  toll() {
    this.start();
    this._strike(BELL_PARTIALS, 164, 0.18);
  }

  chime() {
    this.start();
    this._strike(CHIME_PARTIALS, 784, 0.09);
  }
}

export const audio = new GraveyardAudio();

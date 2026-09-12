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

class GraveyardAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
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

    this._buildAmbience();
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.master) return;

    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.4);
  }

  _noiseBuffer(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise: integrating white noise tilts it toward low frequencies,
    // which is what makes it read as wind instead of static.
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    return buffer;
  }

  _buildAmbience() {
    const ctx = this.ctx;

    const wind = ctx.createBufferSource();
    wind.buffer = this._noiseBuffer(6);
    wind.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.8;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.14;

    // Slow filter sweep so the wind breathes rather than sitting flat.
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.05;
    const sweepDepth = ctx.createGain();
    sweepDepth.gain.value = 230;
    sweep.connect(sweepDepth).connect(windFilter.frequency);

    wind.connect(windFilter).connect(windGain).connect(this.master);
    wind.start();
    sweep.start();

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.035;
    droneGain.connect(this.master);

    for (const frequency of [55, 82.4]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(droneGain);
      osc.start();
    }

    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 0.08;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.02;
    tremolo.connect(tremoloDepth).connect(droneGain.gain);
    tremolo.start();
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

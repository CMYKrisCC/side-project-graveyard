// Synthesized SFX via Web Audio — no external audio files needed.
export class RageAudio {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  _noiseBurst(ctx, now, duration, peakGain, highpassFreq) {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpassFreq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(now);
  }

  thud(rageNorm) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const baseFreq = 220 - rageNorm * 140;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * 2, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(baseFreq, 40), now + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5 + rageNorm * 0.4, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + rageNorm * 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    if (rageNorm > 0.15) {
      this._noiseBurst(ctx, now, 0.12, rageNorm * 0.5, 800 + rageNorm * 2000);
    }
  }

  breakSound() {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);

    this._noiseBurst(ctx, now, 0.5, 0.6, 200);
  }
}

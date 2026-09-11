// Drives the visual reaction: screen shake, hue/contrast escalation, crack overlay.
export class RageEffects {
  constructor({ stage, cracks }) {
    this.stage = stage;
    this.cracks = cracks;
    this.crackPaths = Array.from(cracks.querySelectorAll(".crack"));
    this._raf = null;
    this._getRage = () => 0;
    this._loop = this._loop.bind(this);
  }

  setRage(rageNorm) {
    document.documentElement.style.setProperty("--rage", rageNorm.toFixed(3));

    const tier = rageNorm < 0.25 ? 0 : rageNorm < 0.5 ? 1 : rageNorm < 0.8 ? 2 : rageNorm < 1 ? 3 : 4;
    document.documentElement.dataset.tier = String(tier);

    for (const path of this.crackPaths) {
      const threshold = parseFloat(path.dataset.threshold);
      const opacity = Math.max(0, Math.min(1, (rageNorm - threshold) / 0.15));
      path.style.opacity = String(opacity);
    }
  }

  startShake(getRage) {
    this._getRage = getRage;
    if (!this._raf) this._raf = requestAnimationFrame(this._loop);
  }

  stopShake() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.stage.style.transform = "";
  }

  _loop() {
    const rageNorm = this._getRage();
    const amp = rageNorm * 14;
    if (amp > 0.05) {
      const x = (Math.random() * 2 - 1) * amp;
      const y = (Math.random() * 2 - 1) * amp;
      const rot = (Math.random() * 2 - 1) * amp * 0.3;
      this.stage.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    } else {
      this.stage.style.transform = "";
    }
    this._raf = requestAnimationFrame(this._loop);
  }

  triggerBreak() {
    this.stage.classList.add("glitch-out");
  }

  resetBreak() {
    this.stage.classList.remove("glitch-out");
    for (const path of this.crackPaths) path.style.opacity = "0";
  }
}

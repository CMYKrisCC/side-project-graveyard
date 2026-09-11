import { RageAudio } from "./audio.js";
import { RageEffects } from "./effects.js";

const stage = document.getElementById("stage");
const target = document.getElementById("target");
const cracks = document.getElementById("cracks");
const rageFill = document.getElementById("rage-fill");
const taunt = document.getElementById("taunt");
const surrender = document.getElementById("surrender");
const surrenderMsg = document.getElementById("surrender-msg");
const restartBtn = document.getElementById("restart");

const audio = new RageAudio();
const effects = new RageEffects({ stage, cracks });

const MAX_RAGE = 100;
const DECAY_PER_SEC = 12;
const TAUNTS = [
  [0, "go ahead, tap it."],
  [15, "that tickles."],
  [35, "ok, cut it out."],
  [55, "i'm warning you."],
  [75, "you're really doing this."],
  [90, "last chance."],
];

let rage = 0;
let broken = false;
let clickCount = 0;
let startTime = null;
let lastClickTime = 0;

function currentTaunt(r) {
  let msg = TAUNTS[0][1];
  for (const [threshold, text] of TAUNTS) if (r >= threshold) msg = text;
  return msg;
}

function updateUI() {
  const norm = rage / MAX_RAGE;
  rageFill.style.width = `${norm * 100}%`;
  taunt.textContent = currentTaunt(rage);
  effects.setRage(norm);
}

function elapsedSeconds() {
  if (!startTime) return 0;
  return Math.round((Date.now() - startTime) / 100) / 10;
}

function triggerBreak() {
  broken = true;
  audio.breakSound();
  effects.triggerBreak();

  const clicksNote = clickCount === 1 ? "1 click" : `${clickCount} clicks`;
  surrenderMsg.textContent = `it took ${clicksNote} and ${elapsedSeconds()}s.`;

  setTimeout(() => {
    stage.hidden = true;
    surrender.hidden = false;
  }, 550);
}

function addRage(amount) {
  if (broken) return;
  rage = Math.min(MAX_RAGE, rage + amount);
  updateUI();
  audio.thud(rage / MAX_RAGE);
  if (rage >= MAX_RAGE) triggerBreak();
}

target.addEventListener("pointerdown", () => {
  if (broken) return;
  if (!startTime) startTime = Date.now();
  clickCount++;

  const now = performance.now();
  const gap = now - lastClickTime;
  lastClickTime = now;
  const speedBonus = gap < 220 ? ((220 - gap) / 220) * 6 : 0;
  addRage(4 + speedBonus);

  target.classList.remove("punched");
  void target.offsetWidth; // restart the punch animation
  target.classList.add("punched");
});

restartBtn.addEventListener("click", () => {
  rage = 0;
  broken = false;
  clickCount = 0;
  startTime = null;
  lastClickTime = 0;
  effects.resetBreak();
  stage.hidden = false;
  surrender.hidden = true;
  updateUI();
});

setInterval(() => {
  if (broken || rage <= 0) return;
  rage = Math.max(0, rage - DECAY_PER_SEC / 10);
  updateUI();
}, 100);

effects.startShake(() => rage / MAX_RAGE);
updateUI();

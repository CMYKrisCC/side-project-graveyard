import { useEffect, useRef } from "react";
import { useProgress } from "@react-three/drei";
import { isSceneReady } from "./Graves";

const LINES = [
  "Digging up the past…",
  "Waking the dead…",
  "Lighting the candles…",
  "Reading the epitaphs…",
  "Summoning the caretaker…",
];

// Long enough that a fast, cached load still reads as intentional.
const MIN_VISIBLE_MS = 1400;
// Give up only once loading has stopped moving. A fixed timeout cut off slow
// but healthy connections: on Slow 3G the models legitimately take 30s+, and
// the loader faded onto an empty ground.
const GIVE_UP_WHEN_STALLED_MS = 15000;

export default function Loader() {
  const { progress, loaded, total } = useProgress();

  const latest = useRef({});
  latest.current = { progress, loaded, total };

  useEffect(() => {
    const el = document.getElementById("loader");
    if (!el) return;

    const track = el.querySelector(".loader__track");
    const fill = el.querySelector(".loader__fill");
    const status = el.querySelector(".loader__status");

    // Take over wherever the CSS crawl has reached, so the bar never slides back.
    const floor = Math.min(0.85, fill.offsetWidth / track.offsetWidth || 0);
    let shown = floor;
    let finished = false;
    let line = 0;
    let lastActivity = performance.now();
    let lastSignature = "";

    el.classList.add("is-live");
    el.style.setProperty("--progress", String(shown));

    const rotate = setInterval(() => {
      line = (line + 1) % LINES.length;
      status.classList.remove("is-in");
      void status.offsetWidth;
      status.textContent = LINES[line];
      status.classList.add("is-in");
    }, 1100);

    const tick = setInterval(() => {
      const { progress, loaded, total } = latest.current;
      const now = performance.now();

      const signature = `${loaded}/${total}`;
      if (signature !== lastSignature) {
        lastSignature = signature;
        lastActivity = now;
      }

      const real = total > 0 ? progress / 100 : 0;
      shown = Math.max(shown, floor + (1 - floor) * real);
      el.style.setProperty("--progress", String(Math.min(shown, 0.97)));

      // Wait for the world to actually draw. Inferring readiness from an idle
      // loading manager let the loader vanish over an empty scene.
      const ready = isSceneReady() && now > MIN_VISIBLE_MS;
      if (ready || now - lastActivity > GIVE_UP_WHEN_STALLED_MS) finish();
    }, 120);

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(tick);
      clearInterval(rotate);
      el.style.setProperty("--progress", "1");
      el.classList.add("is-done");
      setTimeout(() => el.remove(), 800);
    }

    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, []);

  return null;
}

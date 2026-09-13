// Drive a handful of visitor sessions around the yard, so the graveyard has
// company while you record. They are real presence sessions using the same
// mutations the app calls — not fake rows — so movement is clamped by the
// server and looks identical to a human visitor.
//
//   node scripts/ghosts.mjs            # 5 ghosts on the dev deployment
//   node scripts/ghosts.mjs 5 --prod   # 5 ghosts on production
//
// Ctrl+C removes them. If the process dies without that, the cron sweep
// clears them about five minutes after their last heartbeat.

import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const PROD_URL = "https://successful-ermine-668.convex.cloud";

const args = process.argv.slice(2);
const useProd = args.includes("--prod");
const count = Number(args.find((a) => /^\d+$/.test(a)) ?? 5);

// Mirrors src/movement.js, so a walk is over when the ghost actually arrives.
const WALK_SPEED = 3.5;
const HEARTBEAT_MS = 10000;

// Keep them in the inner rings, where the camera starts. Wandering to the
// fence line puts them off-frame for most of a shot.
const MIN_RADIUS = 5;
const MAX_RADIUS = 17;

const EMOTES = ["wave", "bow", "mourn"];

function deploymentUrl() {
  if (useProd) return PROD_URL;
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;

  const env = readFileSync(".env.local", "utf8");
  const match = env.match(/^VITE_CONVEX_URL=(.+)$/m);
  if (!match) throw new Error("No VITE_CONVEX_URL in .env.local and no CONVEX_URL set.");
  return match[1].trim();
}

const client = new ConvexHttpClient(deploymentUrl());
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const between = (min, max) => min + Math.random() * (max - min);

function somewhereInTheYard() {
  const angle = Math.random() * Math.PI * 2;
  const radius = between(MIN_RADIUS, MAX_RADIUS);
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

let running = true;

async function haunt(index) {
  const sessionId = `demo-ghost-${index}-${Date.now()}`;
  let at = somewhereInTheYard();

  await client.mutation(api.visitors.arrive, {
    sessionId,
    x: at.x,
    z: at.z,
    // Spread the hues so they read as different visitors, not clones.
    tint: Math.round((index * 360) / count + between(-14, 14)),
  });

  const heartbeat = setInterval(() => {
    client
      .mutation(api.visitors.arrive, { sessionId, x: at.x, z: at.z, tint: 0 })
      .catch(() => {});
  }, HEARTBEAT_MS);

  // Stagger the starts so five ghosts don't set off in lockstep.
  await sleep(between(0, 2600));

  while (running) {
    const to = somewhereInTheYard();
    await client.mutation(api.visitors.move, {
      sessionId,
      fromX: at.x,
      fromZ: at.z,
      toX: to.x,
      toZ: to.z,
    });

    const distance = Math.hypot(to.x - at.x, to.z - at.z);
    at = to;

    await sleep((distance / WALK_SPEED) * 1000);
    // Pausing between walks reads as looking at a grave rather than patrolling.
    await sleep(between(1500, 5000));

    if (Math.random() < 0.25) {
      const emote = EMOTES[Math.floor(Math.random() * EMOTES.length)];
      await client.mutation(api.visitors.emote, { sessionId, emote }).catch(() => {});
      await sleep(between(900, 2000));
    }
  }

  clearInterval(heartbeat);
  await client.mutation(api.visitors.depart, { sessionId }).catch(() => {});
}

console.log(`Haunting ${deploymentUrl()} with ${count} ghosts. Ctrl+C to send them home.`);

process.on("SIGINT", () => {
  if (!running) process.exit(0);
  running = false;
  console.log("\nClearing the ghosts…");
});

await Promise.all(Array.from({ length: count }, (_, i) => haunt(i)));
console.log("Yard is empty.");
process.exit(0);

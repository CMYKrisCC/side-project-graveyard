// Bulk-bury a list of projects. Each entry gets its own session id so the
// per-visitor burial limit doesn't reject the batch.
//
//   node scripts/seed.mjs scripts/seed.json
//
// Entries look like:
//   { "name": "...", "bornYear": 2023, "diedYear": 2024,
//     "cause": "Scope creep was too real.", "epitaph": "" }

import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const entriesPath = process.argv[2] ?? "scripts/seed.json";

function deploymentUrl() {
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;

  const env = readFileSync(".env.local", "utf8");
  const match = env.match(/^VITE_CONVEX_URL=(.+)$/m);
  if (!match) throw new Error("No VITE_CONVEX_URL in .env.local and no CONVEX_URL set.");
  return match[1].trim();
}

const entries = JSON.parse(readFileSync(entriesPath, "utf8"));
const client = new ConvexHttpClient(deploymentUrl());

let buried = 0;

for (const [index, entry] of entries.entries()) {
  try {
    await client.mutation(api.graves.bury, {
      name: entry.name,
      bornYear: entry.bornYear,
      diedYear: entry.diedYear,
      cause: entry.cause,
      epitaph: entry.epitaph ?? "",
      sessionId: `seed-${index}-${entry.name.toLowerCase().replace(/\W+/g, "-")}`,
    });
    buried += 1;
    console.log(`⚰ ${entry.name}`);
  } catch (error) {
    console.error(`✖ ${entry.name}: ${error.message}`);
  }
}

console.log(`\nBuried ${buried} of ${entries.length}.`);

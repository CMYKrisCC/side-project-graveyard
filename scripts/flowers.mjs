// Scatter flowers across the graves on a NON-PRODUCTION deployment, so a
// recording has believable counts without touching the judged record.
//
//   node scripts/flowers.mjs          # ~6 flowers per grave on average
//   node scripts/flowers.mjs 12       # busier yard
//
// Each flower comes from its own session id, because leaveFlower is
// deduplicated per visitor — one session cannot stack a count.
//
// This refuses to run against production on purpose. Flower counts are
// persistent engagement data: seeded ones there would misrepresent how many
// people actually mourned a project.

import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const PROD = "successful-ermine-668";

const average = Number(process.argv[2] ?? 6);

function deploymentUrl() {
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;

  const env = readFileSync(".env.local", "utf8");
  const match = env.match(/^VITE_CONVEX_URL=(.+)$/m);
  if (!match) throw new Error("No VITE_CONVEX_URL in .env.local and no CONVEX_URL set.");
  return match[1].trim();
}

const url = deploymentUrl();

if (url.includes(PROD)) {
  console.error(
    "Refusing to seed flowers on production.\n" +
      "Flower counts are the engagement record judges read, and the Convex\n" +
      "evidence states they reflect distinct visitors. Seed dev instead."
  );
  process.exit(1);
}

const client = new ConvexHttpClient(url);
const graves = await client.query(api.graves.list, {});

if (graves.length === 0) {
  console.error(`No graves on ${url}. Seed them first: npm run seed scripts/seed.json`);
  process.exit(1);
}

console.log(`Leaving flowers on ${graves.length} graves at ${url}\n`);

let left = 0;

for (const grave of graves) {
  // A long tail reads as real mourning: most graves get a few, a couple
  // become monuments. A flat count across every grave looks generated.
  const weight = Math.random() ** 2;
  const target = Math.max(0, Math.round(weight * average * 2.5));

  for (let i = 0; i < target; i += 1) {
    const result = await client.mutation(api.graves.leaveFlower, {
      graveId: grave._id,
      sessionId: `demo-mourner-${grave.plot}-${i}`,
    });
    if (result.added) left += 1;
  }

  if (target > 0) console.log(`❀ ${target.toString().padStart(2)}  ${grave.name}`);
}

console.log(`\nLeft ${left} flowers.`);

import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_VISITORS = 40;

// Mirrors src/layout.js. The graveyard grows outward as it fills, so the
// walkable area grows with it rather than fencing people out of the newest
// rings — and burials never have to be refused for want of space.
const FIRST_RING_RADIUS = 9;
const RING_GAP = 5;
const GRAVE_GAP = 5.2;
const MIN_YARD = 30;
const YARD_MARGIN = 13;

function yardRadiusFor(graveCount: number) {
  let remaining = graveCount;
  let ring = 0;
  let radius = FIRST_RING_RADIUS;

  while (remaining > 0) {
    radius = FIRST_RING_RADIUS + ring * RING_GAP;
    remaining -= Math.max(8, Math.floor((2 * Math.PI * radius) / GRAVE_GAP));
    ring += 1;
  }

  return Math.max(MIN_YARD, radius + YARD_MARGIN);
}

// The mausoleum is solid. Its footprint, plus a little margin.
const CRYPT = { halfX: 3.6, halfZ: 4.4 };

function insideYard(x: number, z: number, yardRadius: number) {
  const walkable = yardRadius - 3;
  const distance = Math.hypot(x, z);
  if (distance <= walkable) return { x, z };

  const scale = walkable / distance;
  return { x: x * scale, z: z * scale };
}

// Pushes a destination out of the crypt along whichever wall it is nearest.
function outsideCrypt(x: number, z: number, yardRadius: number) {
  const cryptZ = -(yardRadius - 6);
  const dx = x;
  const dz = z - cryptZ;
  if (Math.abs(dx) > CRYPT.halfX || Math.abs(dz) > CRYPT.halfZ) return { x, z };

  const escapeX = CRYPT.halfX - Math.abs(dx);
  const escapeZ = CRYPT.halfZ - Math.abs(dz);

  return escapeX < escapeZ
    ? { x: dx >= 0 ? CRYPT.halfX : -CRYPT.halfX, z }
    : { x, z: cryptZ + (dz >= 0 ? CRYPT.halfZ : -CRYPT.halfZ) };
}

function walkable(x: number, z: number, yardRadius: number) {
  const bounded = insideYard(x, z, yardRadius);
  return outsideCrypt(bounded.x, bounded.z, yardRadius);
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Staleness is judged on the client: a query can't use wall-clock time to
    // decide freshness, since it only re-runs when the data itself changes.
    return await ctx.db.query("visitors").withIndex("by_lastSeen").order("desc").take(MAX_VISITORS);
  },
});

export const arrive = mutation({
  args: { sessionId: v.string(), x: v.number(), z: v.number(), tint: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("visitors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
      return;
    }

    await ctx.db.insert("visitors", {
      sessionId: args.sessionId,
      fromX: args.x,
      fromZ: args.z,
      toX: args.x,
      toZ: args.z,
      startedAt: now,
      lastSeen: now,
      tint: args.tint,
    });
  },
});

// One write per click instead of a position stream: every client animates the
// same path from the same timestamp.
export const move = mutation({
  args: {
    sessionId: v.string(),
    fromX: v.number(),
    fromZ: v.number(),
    toX: v.number(),
    toZ: v.number(),
  },
  handler: async (ctx, args) => {
    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (!visitor) return;

    const newest = await ctx.db.query("graves").withIndex("by_plot").order("desc").first();
    const yardRadius = yardRadiusFor((newest?.plot ?? -1) + 1);

    const from = walkable(args.fromX, args.fromZ, yardRadius);
    const to = walkable(args.toX, args.toZ, yardRadius);
    const now = Date.now();

    await ctx.db.patch(visitor._id, {
      fromX: from.x,
      fromZ: from.z,
      toX: to.x,
      toZ: to.z,
      startedAt: now,
      lastSeen: now,
    });
  },
});

const EMOTES = ["wave", "bow", "mourn"];

export const emote = mutation({
  args: { sessionId: v.string(), emote: v.string() },
  handler: async (ctx, args) => {
    if (!EMOTES.includes(args.emote)) return;

    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (!visitor) return;

    const now = Date.now();
    await ctx.db.patch(visitor._id, { emote: args.emote, emoteAt: now, lastSeen: now });
  },
});

export const depart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (visitor) await ctx.db.delete(visitor._id);
  },
});

export const sweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    const stale = await ctx.db
      .query("visitors")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeen", cutoff))
      .take(100);

    for (const visitor of stale) await ctx.db.delete(visitor._id);
  },
});

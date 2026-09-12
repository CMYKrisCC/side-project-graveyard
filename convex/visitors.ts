import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_VISITORS = 40;
// Keep visitors inside the fence rather than wandering off across empty ground.
const YARD_RADIUS = 27;

// The mausoleum is solid. Its footprint, plus a little margin.
const CRYPT = { x: 0, z: -26, halfX: 3.6, halfZ: 4.4 };

function insideYard(x: number, z: number) {
  const distance = Math.hypot(x, z);
  if (distance <= YARD_RADIUS) return { x, z };

  const scale = YARD_RADIUS / distance;
  return { x: x * scale, z: z * scale };
}

// Pushes a destination out of the crypt along whichever wall it is nearest.
function outsideCrypt(x: number, z: number) {
  const dx = x - CRYPT.x;
  const dz = z - CRYPT.z;
  if (Math.abs(dx) > CRYPT.halfX || Math.abs(dz) > CRYPT.halfZ) return { x, z };

  const escapeX = CRYPT.halfX - Math.abs(dx);
  const escapeZ = CRYPT.halfZ - Math.abs(dz);

  return escapeX < escapeZ
    ? { x: CRYPT.x + (dx >= 0 ? CRYPT.halfX : -CRYPT.halfX), z }
    : { x, z: CRYPT.z + (dz >= 0 ? CRYPT.halfZ : -CRYPT.halfZ) };
}

function walkable(x: number, z: number) {
  const bounded = insideYard(x, z);
  return outsideCrypt(bounded.x, bounded.z);
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

    const from = walkable(args.fromX, args.fromZ);
    const to = walkable(args.toX, args.toZ);
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

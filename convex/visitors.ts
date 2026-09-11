import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_VISITORS = 40;

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

    const now = Date.now();
    await ctx.db.patch(visitor._id, {
      fromX: args.fromX,
      fromZ: args.fromZ,
      toX: args.toX,
      toZ: args.toZ,
      startedAt: now,
      lastSeen: now,
    });
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

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  graves: defineTable({
    plot: v.number(),
    name: v.string(),
    bornYear: v.number(),
    diedYear: v.number(),
    cause: v.string(),
    epitaph: v.string(),
    style: v.number(),
    flowers: v.number(),
    flags: v.number(),
    hidden: v.boolean(),
    sessionId: v.string(),
    // When the candle was last lit. Absent means it has never been lit.
    candleLitAt: v.optional(v.number()),
  })
    .index("by_plot", ["plot"])
    .index("by_session", ["sessionId"]),

  flowerEvents: defineTable({
    graveId: v.id("graves"),
    sessionId: v.string(),
  }).index("by_grave_session", ["graveId", "sessionId"]),

  visitors: defineTable({
    sessionId: v.string(),
    fromX: v.number(),
    fromZ: v.number(),
    toX: v.number(),
    toZ: v.number(),
    startedAt: v.number(),
    lastSeen: v.number(),
    tint: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_lastSeen", ["lastSeen"]),
});

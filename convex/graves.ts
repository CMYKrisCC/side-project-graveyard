import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { CAUSES } from "./causes";
import { isClean, sanitize } from "./moderation";

const MAX_GRAVES = 600;
const BURIALS_PER_SESSION = 3;
const HIDE_AT_FLAGS = 3;
const GRAVESTONE_STYLES = 9;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const graves = await ctx.db
      .query("graves")
      .withIndex("by_plot")
      .order("desc")
      .take(MAX_GRAVES);

    return graves
      .filter((grave) => !grave.hidden)
      .map(({ _id, plot, name, bornYear, diedYear, cause, epitaph, style, flowers }) => ({
        _id,
        plot,
        name,
        bornYear,
        diedYear,
        cause,
        epitaph,
        style,
        flowers,
      }));
  },
});

export const bury = mutation({
  args: {
    name: v.string(),
    bornYear: v.number(),
    diedYear: v.number(),
    cause: v.string(),
    epitaph: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const name = sanitize(args.name, 40);
    const epitaph = sanitize(args.epitaph, 80);

    if (name.length === 0) throw new Error("Give the project a name.");
    if (!isClean(name) || !isClean(epitaph)) {
      throw new Error("Let's keep it printable.");
    }
    if (!CAUSES.includes(args.cause as (typeof CAUSES)[number])) {
      throw new Error("Pick a cause of death from the list.");
    }

    const thisYear = new Date().getUTCFullYear();
    const bornYear = Math.min(Math.max(Math.round(args.bornYear), 1970), thisYear);
    const diedYear = Math.min(Math.max(Math.round(args.diedYear), bornYear), thisYear);

    const alreadyBuried = await ctx.db
      .query("graves")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .take(BURIALS_PER_SESSION);
    if (alreadyBuried.length >= BURIALS_PER_SESSION) {
      throw new Error("That's enough grief for one visit.");
    }

    // Plot allocation. This read and the insert below run in one transaction, so
    // two simultaneous burials can never be handed the same plot — the loser of
    // the race is retried against the new highest plot.
    const lastGrave = await ctx.db.query("graves").withIndex("by_plot").order("desc").first();
    const plot = (lastGrave?.plot ?? -1) + 1;

    return await ctx.db.insert("graves", {
      plot,
      name,
      bornYear,
      diedYear,
      cause: args.cause,
      epitaph,
      style: plot % GRAVESTONE_STYLES,
      flowers: 0,
      flags: 0,
      hidden: false,
      sessionId: args.sessionId,
    });
  },
});

export const leaveFlower = mutation({
  args: { graveId: v.id("graves"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("flowerEvents")
      .withIndex("by_grave_session", (q) =>
        q.eq("graveId", args.graveId).eq("sessionId", args.sessionId)
      )
      .first();
    if (existing) return { added: false };

    const grave = await ctx.db.get(args.graveId);
    if (!grave) return { added: false };

    await ctx.db.insert("flowerEvents", { graveId: args.graveId, sessionId: args.sessionId });
    await ctx.db.patch(args.graveId, { flowers: grave.flowers + 1 });
    return { added: true };
  },
});

export const report = mutation({
  args: { graveId: v.id("graves") },
  handler: async (ctx, args) => {
    const grave = await ctx.db.get(args.graveId);
    if (!grave) return;

    const flags = grave.flags + 1;
    await ctx.db.patch(args.graveId, { flags, hidden: flags >= HIDE_AT_FLAGS });
  },
});

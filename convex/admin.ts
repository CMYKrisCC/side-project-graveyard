import { internalMutation } from "./_generated/server";

// internalMutation, not mutation: this must never be reachable from the client.
// Run it with `npx convex run admin:clearGraves`, which requires CLI auth.
export const clearGraves = internalMutation({
  args: {},
  handler: async (ctx) => {
    const graves = await ctx.db.query("graves").take(2000);
    for (const grave of graves) await ctx.db.delete(grave._id);

    // Flower events point at grave ids, so they go too or the next grave to
    // reuse an id would inherit someone else's flowers.
    const events = await ctx.db.query("flowerEvents").take(5000);
    for (const event of events) await ctx.db.delete(event._id);

    return { graves: graves.length, flowerEvents: events.length };
  },
});

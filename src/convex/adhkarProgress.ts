import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { adhkarBySession } from "./adhkarData";
import { mutation, query } from "./_generated/server";

const sessionValidator = v.union(v.literal("morning"), v.literal("evening"));

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La date doit être au format AAAA-MM-JJ.");
  }
}

export const forDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    assertDate(date);
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("adhkarProgress")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .collect();
  },
});

export const recordRepetition = mutation({
  args: {
    date: v.string(),
    session: sessionValidator,
    invocationId: v.string(),
  },
  handler: async (ctx, { date, session, invocationId }) => {
    assertDate(date);
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Vous devez être connecté pour enregistrer.");

    const sequence = adhkarBySession[session];
    const existing = await ctx.db
      .query("adhkarProgress")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .filter((q) => q.eq(q.field("session"), session))
      .unique();
    const currentIndex = existing?.currentIndex ?? 0;
    const currentInvocation = sequence[currentIndex];

    if (!currentInvocation || currentInvocation.id !== invocationId) {
      throw new Error("Terminez l’invocation en cours avant de continuer.");
    }

    const repetitionCount = (existing?.repetitionCount ?? 0) + 1;
    if (repetitionCount > currentInvocation.repetitions) {
      throw new Error("Cette invocation est déjà terminée.");
    }
    const progress = { currentIndex, repetitionCount };

    if (existing) {
      await ctx.db.patch(existing._id, progress);
    } else {
      await ctx.db.insert("adhkarProgress", {
        userId,
        date,
        session,
        ...progress,
      });
    }
  },
});

export const advance = mutation({
  args: {
    date: v.string(),
    session: sessionValidator,
    invocationId: v.string(),
  },
  handler: async (ctx, { date, session, invocationId }) => {
    assertDate(date);
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Vous devez être connecté pour enregistrer.");

    const sequence = adhkarBySession[session];
    const existing = await ctx.db
      .query("adhkarProgress")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .filter((q) => q.eq(q.field("session"), session))
      .unique();
    const currentIndex = existing?.currentIndex ?? 0;
    const currentInvocation = sequence[currentIndex];

    if (
      !existing ||
      !currentInvocation ||
      currentInvocation.id !== invocationId ||
      existing.repetitionCount < currentInvocation.repetitions
    ) {
      throw new Error("Récitez toutes les répétitions avant de passer à la suite.");
    }

    await ctx.db.patch(existing._id, {
      currentIndex: currentIndex + 1,
      repetitionCount: 0,
    });
  },
});

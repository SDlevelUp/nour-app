import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La date doit être au format AAAA-MM-JJ.");
  }
}

function assertTime(time: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("L’heure doit être au format HH:MM.");
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("quranReadingLogs")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const forPlanner = query({
  args: { fromDate: v.string(), toDate: v.string() },
  handler: async (ctx, { fromDate, toDate }) => {
    assertDate(fromDate);
    assertDate(toDate);
    if (fromDate > toDate) throw new Error("La période demandée est invalide.");
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("quranReadingLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", fromDate).lte("date", toDate),
      )
      .collect();
  },
});

export const add = mutation({
  args: {
    date: v.string(),
    time: v.optional(v.string()),
    passage: v.string(),
    pagesOrVerses: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertDate(args.date);
    const time = args.time ?? "07:00";
    assertTime(time);
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer.");

    const passage = args.passage.trim();
    const pagesOrVerses = args.pagesOrVerses?.trim() || undefined;
    const notes = args.notes?.trim() || undefined;
    if (!passage) throw new Error("Indiquez la sourate ou le passage lu.");
    if (passage.length > 120) throw new Error("Le passage est trop long.");
    if (pagesOrVerses && pagesOrVerses.length > 120) {
      throw new Error("La référence des pages ou versets est trop longue.");
    }
    if (notes && notes.length > 2000) {
      throw new Error("La note ne peut pas dépasser 2 000 caractères.");
    }

    await ctx.db.insert("quranReadingLogs", {
      userId,
      date: args.date,
      time,
      passage,
      pagesOrVerses,
      notes,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { logId: v.id("quranReadingLogs") },
  handler: async (ctx, { logId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour supprimer.");

    const log = await ctx.db.get(logId);
    if (!log || log.userId !== userId) {
      throw new Error("Cette entrée est introuvable.");
    }
    await ctx.db.delete(logId);
  },
});

export const updateSchedule = mutation({
  args: {
    logId: v.id("quranReadingLogs"),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, { logId, date, time }) => {
    assertDate(date);
    assertTime(time);
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour modifier cette lecture.");
    const log = await ctx.db.get(logId);
    if (!log || log.userId !== userId) {
      throw new Error("Cette lecture est introuvable.");
    }
    await ctx.db.patch(logId, { date, time });
  },
});

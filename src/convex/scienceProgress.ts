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
      .query("scienceStudyLogs")
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
      .query("scienceStudyLogs")
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
    title: v.string(),
    lesson: v.string(),
    source: v.optional(v.string()),
    url: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertDate(args.date);
    const time = args.time ?? "10:00";
    assertTime(time);
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer.");

    const title = args.title.trim();
    const lesson = args.lesson.trim();
    const source = args.source?.trim() || undefined;
    const url = args.url?.trim() || undefined;
    const notes = args.notes?.trim() || undefined;
    if (!title) throw new Error("Indiquez le cours ou le livre étudié.");
    if (!lesson) throw new Error("Indiquez la leçon étudiée.");
    if (title.length > 160 || lesson.length > 200) {
      throw new Error("Le titre ou la leçon est trop long.");
    }
    if (source && source.length > 160)
      throw new Error("La source est trop longue.");
    if (notes && notes.length > 2000) {
      throw new Error("La note ne peut pas dépasser 2 000 caractères.");
    }
    if (url) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new Error("Le lien fourni n’est pas une URL valide.");
      }
      if (parsedUrl.protocol !== "https:") {
        throw new Error("Le lien doit commencer par https://.");
      }
    }

    await ctx.db.insert("scienceStudyLogs", {
      userId,
      date: args.date,
      time,
      title,
      lesson,
      source,
      url,
      notes,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { logId: v.id("scienceStudyLogs") },
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
    logId: v.id("scienceStudyLogs"),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, { logId, date, time }) => {
    assertDate(date);
    assertTime(time);
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour modifier cette séance.");
    const log = await ctx.db.get(logId);
    if (!log || log.userId !== userId) {
      throw new Error("Cette séance est introuvable.");
    }
    await ctx.db.patch(logId, { date, time });
  },
});

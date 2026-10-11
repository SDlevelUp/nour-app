import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const kind = v.union(v.literal("matn"), v.literal("hadith"));
const status = v.union(
  v.literal("to-learn"),
  v.literal("learning"),
  v.literal("memorized"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("scienceLearningItems")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    kind,
    title: v.string(),
    status,
    portions: v.array(v.string()),
    reviewDate: v.optional(v.string()),
    arabic: v.optional(v.string()),
    transliteration: v.optional(v.string()),
    translation: v.optional(v.string()),
    narrator: v.optional(v.string()),
    collection: v.optional(v.string()),
    number: v.optional(v.string()),
    grade: v.optional(v.string()),
    gradingSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour enregistrer cette fiche.");
    const title = args.title.trim();
    if (!title || title.length > 200) {
      throw new Error("Indique un titre de 1 à 200 caractères.");
    }
    if (args.portions.length > 100 || args.portions.some((part) => part.length > 2000)) {
      throw new Error("Vérifie les portions (100 maximum, 2 000 caractères chacune).");
    }
    await ctx.db.insert("scienceLearningItems", {
      ...args,
      title,
      portions: args.portions.map((part) => part.trim()).filter(Boolean),
      createdAt: Date.now(),
      userId,
    });
  },
});

export const setStatus = mutation({
  args: { itemId: v.id("scienceLearningItems"), status },
  handler: async (ctx, { itemId, status: nextStatus }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour modifier cette fiche.");
    const item = await ctx.db.get(itemId);
    if (!item || item.userId !== userId) throw new Error("Cette fiche est introuvable.");
    await ctx.db.patch(itemId, { status: nextStatus });
  },
});

export const setReviewDate = mutation({
  args: { itemId: v.id("scienceLearningItems"), reviewDate: v.optional(v.string()) },
  handler: async (ctx, { itemId, reviewDate }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour modifier cette fiche.");
    const item = await ctx.db.get(itemId);
    if (!item || item.userId !== userId) throw new Error("Cette fiche est introuvable.");
    await ctx.db.patch(itemId, { reviewDate: reviewDate || undefined });
  },
});

export const remove = mutation({
  args: { itemId: v.id("scienceLearningItems") },
  handler: async (ctx, { itemId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour supprimer cette fiche.");
    const item = await ctx.db.get(itemId);
    if (!item || item.userId !== userId) throw new Error("Cette fiche est introuvable.");
    await ctx.db.delete(itemId);
  },
});

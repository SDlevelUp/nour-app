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

const contentFields = {
  title: v.string(),
  portions: v.array(v.string()),
  arabic: v.optional(v.string()),
  transliteration: v.optional(v.string()),
  translation: v.optional(v.string()),
  narrator: v.optional(v.string()),
  collection: v.optional(v.string()),
  number: v.optional(v.string()),
  grade: v.optional(v.string()),
  gradingSource: v.optional(v.string()),
};

const optionalText = (value?: string) => value?.trim() || undefined;

// Vérifications communes à l’ajout et à la modification d’une fiche.
function cleanContent(args: {
  title: string;
  portions: string[];
  arabic?: string;
  transliteration?: string;
  translation?: string;
  narrator?: string;
  collection?: string;
  number?: string;
  grade?: string;
  gradingSource?: string;
}) {
  const title = args.title.trim();
  if (!title || title.length > 200) {
    throw new Error("Indique un titre de 1 à 200 caractères.");
  }
  if (args.portions.length > 100 || args.portions.some((part) => part.length > 2000)) {
    throw new Error("Vérifie les portions (100 maximum, 2 000 caractères chacune).");
  }
  if (args.arabic && args.arabic.length > 20000) {
    throw new Error("Le texte arabe ne peut pas dépasser 20 000 caractères.");
  }
  return {
    title,
    portions: args.portions.map((part) => part.trim()).filter(Boolean),
    arabic: optionalText(args.arabic),
    transliteration: optionalText(args.transliteration),
    translation: optionalText(args.translation),
    narrator: optionalText(args.narrator),
    collection: optionalText(args.collection),
    number: optionalText(args.number),
    grade: optionalText(args.grade),
    gradingSource: optionalText(args.gradingSource),
  };
}

export const add = mutation({
  args: {
    kind,
    status,
    reviewDate: v.optional(v.string()),
    ...contentFields,
  },
  handler: async (ctx, { kind: itemKind, status: itemStatus, reviewDate, ...content }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour enregistrer cette fiche.");
    await ctx.db.insert("scienceLearningItems", {
      kind: itemKind,
      status: itemStatus,
      reviewDate,
      ...cleanContent(content),
      createdAt: Date.now(),
      userId,
    });
  },
});

// Corriger le contenu d’une fiche (faute de frappe, portion oubliée…) ; le type ne change pas.
export const update = mutation({
  args: { itemId: v.id("scienceLearningItems"), ...contentFields },
  handler: async (ctx, { itemId, ...content }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour modifier cette fiche.");
    const item = await ctx.db.get(itemId);
    if (!item || item.userId !== userId) throw new Error("Cette fiche est introuvable.");
    await ctx.db.patch(itemId, cleanContent(content));
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

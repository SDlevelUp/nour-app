import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const bookStatus = v.union(
  v.literal("to-read"),
  v.literal("in-progress"),
  v.literal("read"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("scienceBooks")
      .withIndex("by_user_position", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour ajouter un livre.");
    const title = args.title.trim();
    const author = args.author.trim();
    const notes = args.notes?.trim() || undefined;
    if (!title || !author) throw new Error("Indique le titre et l’auteur.");
    if (title.length > 200 || author.length > 160) {
      throw new Error("Le titre ou le nom de l’auteur est trop long.");
    }
    if (notes && notes.length > 5000) {
      throw new Error("Les notes ne peuvent pas dépasser 5 000 caractères.");
    }
    await ctx.db.insert("scienceBooks", {
      userId,
      title,
      author,
      notes,
      status: "to-read",
      position: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    bookId: v.id("scienceBooks"),
    title: v.string(),
    author: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour modifier ce livre.");
    const book = await ctx.db.get(args.bookId);
    if (!book || book.userId !== userId) {
      throw new Error("Ce livre est introuvable.");
    }
    const title = args.title.trim();
    const author = args.author.trim();
    const notes = args.notes?.trim() || undefined;
    if (!title || !author) throw new Error("Indique le titre et l’auteur.");
    if (title.length > 200 || author.length > 160) {
      throw new Error("Le titre ou le nom de l’auteur est trop long.");
    }
    if (notes && notes.length > 5000) {
      throw new Error("Les notes ne peuvent pas dépasser 5 000 caractères.");
    }
    await ctx.db.patch(args.bookId, { title, author, notes });
  },
});

export const setStatus = mutation({
  args: { bookId: v.id("scienceBooks"), status: bookStatus },
  handler: async (ctx, { bookId, status }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour modifier ce livre.");
    const book = await ctx.db.get(bookId);
    if (!book || book.userId !== userId) {
      throw new Error("Ce livre est introuvable.");
    }
    await ctx.db.patch(bookId, { status });
  },
});

export const reorder = mutation({
  args: { bookIds: v.array(v.id("scienceBooks")) },
  handler: async (ctx, { bookIds }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour réordonner les livres.");
    const uniqueIds = new Set(bookIds);
    if (uniqueIds.size !== bookIds.length) {
      throw new Error("La liste des livres n’est pas valide.");
    }
    const books = await ctx.db
      .query("scienceBooks")
      .withIndex("by_user_position", (q) => q.eq("userId", userId))
      .collect();
    const upcomingBooks = books.filter((book) => book.status !== "read");
    if (
      upcomingBooks.length !== bookIds.length ||
      bookIds.some((bookId) => !upcomingBooks.some((book) => book._id === bookId))
    ) {
      throw new Error("La liste des prochaines lectures a changé. Réessaie.");
    }
    await Promise.all(
      bookIds.map((bookId, index) =>
        ctx.db.patch(bookId, { position: index + 1 }),
      ),
    );
  },
});

export const remove = mutation({
  args: { bookId: v.id("scienceBooks") },
  handler: async (ctx, { bookId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Connecte-toi pour supprimer ce livre.");
    const book = await ctx.db.get(bookId);
    if (!book || book.userId !== userId) {
      throw new Error("Ce livre est introuvable.");
    }
    await ctx.db.delete(bookId);
  },
});

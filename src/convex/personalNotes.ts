import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const noteColorValidator = v.union(
  v.literal("yellow"),
  v.literal("pink"),
  v.literal("blue"),
  v.literal("green"),
  v.literal("lavender"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("personalNotes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    content: v.string(),
    title: v.optional(v.string()),
    urgent: v.optional(v.boolean()),
    color: v.optional(noteColorValidator),
    isTask: v.optional(v.boolean()),
  },
  handler: async (ctx, { content, title, urgent, color, isTask }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer une note.");

    const trimmedContent = content.trim();
    if (!trimmedContent) throw new Error("La note ne peut pas être vide.");
    if (trimmedContent.length > 5000) {
      throw new Error("La note ne peut pas dépasser 5 000 caractères.");
    }
    const trimmedTitle = title?.trim();
    if (trimmedTitle && trimmedTitle.length > 100) {
      throw new Error("Le titre ne peut pas dépasser 100 caractères.");
    }

    await ctx.db.insert("personalNotes", {
      userId,
      content: trimmedContent,
      title: trimmedTitle || undefined,
      createdAt: Date.now(),
      isUnread: true,
      urgent: urgent ?? false,
      isTask: isTask ?? false,
      completed: false,
      color: color ?? "yellow",
      position: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("personalNotes"),
    title: v.string(),
    content: v.string(),
    urgent: v.boolean(),
    color: noteColorValidator,
  },
  handler: async (ctx, { noteId, title, content, urgent, color }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Connecte-toi pour modifier une note.");
    }
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Cette note est introuvable.");
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle) throw new Error("Indiquez un titre pour cette note.");
    if (trimmedTitle.length > 100) {
      throw new Error("Le titre ne peut pas dépasser 100 caractères.");
    }
    if (!trimmedContent) throw new Error("La note ne peut pas être vide.");
    if (trimmedContent.length > 5000) {
      throw new Error("La note ne peut pas dépasser 5 000 caractères.");
    }

    await ctx.db.patch(noteId, {
      title: trimmedTitle,
      content: trimmedContent,
      urgent,
      color,
    });
  },
});

export const reorder = mutation({
  args: {
    noteIds: v.array(v.id("personalNotes")),
    archived: v.boolean(),
  },
  handler: async (ctx, { noteIds, archived }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Connecte-toi pour déplacer les notes.");
    }
    const uniqueIds = new Set(noteIds);
    if (uniqueIds.size !== noteIds.length || noteIds.length > 2000) {
      throw new Error("La liste des notes à déplacer n’est pas valide.");
    }

    const userNotes = await ctx.db
      .query("personalNotes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .collect();
    const targetNotes = userNotes.filter(
      (note) => (note.archived === true) === archived,
    );
    if (
      targetNotes.length !== noteIds.length ||
      noteIds.some((noteId) => !targetNotes.some((note) => note._id === noteId))
    ) {
      throw new Error("La liste des notes a changé. Réessaie.");
    }

    await Promise.all(
      noteIds.map((noteId, index) =>
        ctx.db.patch(noteId, { position: noteIds.length - index }),
      ),
    );
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;

    const notes = await ctx.db
      .query("personalNotes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(
      notes
        .filter((note) => note.isUnread && !note.archived)
        .map((note) => ctx.db.patch(note._id, { isUnread: false })),
    );
  },
});

export const setArchived = mutation({
  args: {
    noteId: v.id("personalNotes"),
    archived: v.boolean(),
  },
  handler: async (ctx, { noteId, archived }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour modifier cette note.");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Cette note est introuvable.");
    }

    await ctx.db.patch(noteId, { archived });
  },
});

export const setTaskCompleted = mutation({
  args: {
    noteId: v.id("personalNotes"),
    completed: v.boolean(),
  },
  handler: async (ctx, { noteId, completed }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour modifier cette tâche.");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId || note.isTask !== true) {
      throw new Error("Cette tâche est introuvable.");
    }

    await ctx.db.patch(noteId, { completed });
  },
});

export const remove = mutation({
  args: { noteId: v.id("personalNotes") },
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour supprimer cette note.");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Cette note est introuvable.");
    }

    await ctx.db.delete(noteId);
  },
});

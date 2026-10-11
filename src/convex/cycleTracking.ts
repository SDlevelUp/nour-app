import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const symptomValidator = v.union(
  v.literal("bloating"),
  v.literal("cramps"),
  v.literal("fatigue"),
  v.literal("headache"),
  v.literal("mood"),
  v.literal("tender_breasts"),
  v.literal("other"),
);

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La date doit être au format AAAA-MM-JJ.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error("La date sélectionnée n’est pas valide.");
  }
}

export const list = query({
  args: {
    fromDate: v.string(),
    toDate: v.string(),
  },
  handler: async (ctx, { fromDate, toDate }) => {
    assertDate(fromDate);
    assertDate(toDate);
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("cycleDays")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", fromDate).lte("date", toDate),
      )
      .collect();
  },
});

export const saveDay = mutation({
  args: {
    date: v.string(),
    isPeriodDay: v.boolean(),
    symptoms: v.array(symptomValidator),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { date, isPeriodDay, symptoms, note }) => {
    assertDate(date);
    if (note !== undefined && note.length > 2000) {
      throw new Error("La note ne peut pas dépasser 2 000 caractères.");
    }
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer.");

    const existing = await ctx.db
      .query("cycleDays")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();

    const trimmedNote = note?.trim() || undefined;
    if (!isPeriodDay && symptoms.length === 0 && !trimmedNote) {
      if (existing) await ctx.db.delete(existing._id);
      return;
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        isPeriodDay,
        symptoms,
        note: trimmedNote,
      });
    } else {
      await ctx.db.insert("cycleDays", {
        userId,
        date,
        isPeriodDay,
        symptoms,
        note: trimmedNote,
      });
    }
  },
});

export const setPeriodRange = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    isPeriodDay: v.boolean(),
  },
  handler: async (ctx, { startDate, endDate, isPeriodDay }) => {
    assertDate(startDate);
    assertDate(endDate);
    if (startDate > endDate)
      throw new Error("La date de début doit précéder la date de fin.");

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (days > 60) throw new Error("Une plage ne peut pas dépasser 60 jours.");

    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer.");

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(start.getTime() + offset * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const existing = await ctx.db
        .query("cycleDays")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", date),
        )
        .unique();

      if (existing) {
        if (!isPeriodDay && existing.symptoms.length === 0 && !existing.note) {
          await ctx.db.delete(existing._id);
        } else {
          await ctx.db.patch(existing._id, { isPeriodDay });
        }
      } else if (isPeriodDay) {
        await ctx.db.insert("cycleDays", {
          userId,
          date,
          isPeriodDay: true,
          symptoms: [],
        });
      }
    }
  },
});

export const updatePeriodRange = mutation({
  args: {
    previousStartDate: v.string(),
    previousEndDate: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (
    ctx,
    { previousStartDate, previousEndDate, startDate, endDate },
  ) => {
    assertDate(previousStartDate);
    assertDate(previousEndDate);
    assertDate(startDate);
    assertDate(endDate);
    if (previousStartDate > previousEndDate || startDate > endDate) {
      throw new Error("La date de début doit précéder la date de fin.");
    }

    const previousStart = new Date(`${previousStartDate}T00:00:00.000Z`);
    const previousEnd = new Date(`${previousEndDate}T00:00:00.000Z`);
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    const previousDays =
      Math.floor(
        (previousEnd.getTime() - previousStart.getTime()) / 86_400_000,
      ) + 1;
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (previousDays > 60 || days > 60) {
      throw new Error("Une plage ne peut pas dépasser 60 jours.");
    }

    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Connecte-toi pour modifier cette période.");
    }

    const newDates = new Set<string>();
    for (let offset = 0; offset < days; offset += 1) {
      newDates.add(
        new Date(start.getTime() + offset * 86_400_000)
          .toISOString()
          .slice(0, 10),
      );
    }

    for (let offset = 0; offset < previousDays; offset += 1) {
      const date = new Date(previousStart.getTime() + offset * 86_400_000)
        .toISOString()
        .slice(0, 10);
      if (newDates.has(date)) continue;

      const existing = await ctx.db
        .query("cycleDays")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", date),
        )
        .unique();
      if (!existing?.isPeriodDay) continue;
      if (existing.symptoms.length === 0 && !existing.note) {
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, { isPeriodDay: false });
      }
    }

    for (const date of newDates) {
      const existing = await ctx.db
        .query("cycleDays")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", date),
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { isPeriodDay: true });
      } else {
        await ctx.db.insert("cycleDays", {
          userId,
          date,
          isPeriodDay: true,
          symptoms: [],
        });
      }
    }
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { lateAlertsEnabled: false };

    const settings = await ctx.db
      .query("cycleSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return { lateAlertsEnabled: settings?.lateAlertsEnabled ?? false };
  },
});

export const setLateAlertsEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new Error("Connecte-toi pour enregistrer.");

    const existing = await ctx.db
      .query("cycleSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lateAlertsEnabled: enabled });
    } else {
      await ctx.db.insert("cycleSettings", {
        userId,
        lateAlertsEnabled: enabled,
      });
    }
  },
});

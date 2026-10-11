import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    cycleDays: defineTable({
      userId: v.id("users"),
      date: v.string(),
      isPeriodDay: v.boolean(),
      note: v.optional(v.string()),
      symptoms: v.array(
        v.union(
          v.literal("bloating"),
          v.literal("cramps"),
          v.literal("fatigue"),
          v.literal("headache"),
          v.literal("mood"),
          v.literal("tender_breasts"),
          v.literal("other"),
        ),
      ),
    }).index("by_user_date", ["userId", "date"]),

    cycleSettings: defineTable({
      userId: v.id("users"),
      lateAlertsEnabled: v.boolean(),
    }).index("by_user", ["userId"]),

    personalNotes: defineTable({
      userId: v.id("users"),
      content: v.string(),
      title: v.optional(v.string()),
      createdAt: v.number(),
      isUnread: v.boolean(),
      archived: v.optional(v.boolean()),
      urgent: v.optional(v.boolean()),
      isTask: v.optional(v.boolean()),
      completed: v.optional(v.boolean()),
      color: v.optional(
        v.union(
          v.literal("yellow"),
          v.literal("pink"),
          v.literal("blue"),
          v.literal("green"),
          v.literal("lavender"),
        ),
      ),
      position: v.optional(v.number()),
    }).index("by_user_createdAt", ["userId", "createdAt"]),

    adhkarProgress: defineTable({
      userId: v.id("users"),
      date: v.string(),
      session: v.union(v.literal("morning"), v.literal("evening")),
      currentIndex: v.number(),
      repetitionCount: v.number(),
    }).index("by_user_date", ["userId", "date"]),

    quranReadingLogs: defineTable({
      userId: v.id("users"),
      date: v.string(),
      time: v.optional(v.string()),
      passage: v.string(),
      pagesOrVerses: v.optional(v.string()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user_createdAt", ["userId", "createdAt"])
      .index("by_user_date", ["userId", "date"]),

    scienceStudyLogs: defineTable({
      userId: v.id("users"),
      date: v.string(),
      time: v.optional(v.string()),
      title: v.string(),
      lesson: v.string(),
      source: v.optional(v.string()),
      url: v.optional(v.string()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user_createdAt", ["userId", "createdAt"])
      .index("by_user_date", ["userId", "date"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

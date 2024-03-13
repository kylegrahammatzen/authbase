import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const accounts = pgTable("account", {
  id: uuid("id").notNull().primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastPasswordChange: timestamp("lastPasswordChange", { mode: "date" }),
});

export const account_emails = pgTable("account_email", {
  id: uuid("id").notNull().primaryKey(),
  accountId: uuid("accountId")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const sessions = pgTable("session", {
  id: uuid("id").notNull().primaryKey(),
  accountId: uuid("accountId")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastActive: timestamp("lastActive", { mode: "date" }).notNull(),
});

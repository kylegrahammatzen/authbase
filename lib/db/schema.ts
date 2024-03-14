import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

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
  isPrimary: boolean("isPrimary").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  verificationTimestamp: timestamp("verificationTimestamp", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const account_verifications = pgTable("account_email_verification", {
  id: uuid("id").notNull().primaryKey(),
  accountId: uuid("accountId")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  accountEmailId: uuid("accountEmailId")
    .notNull()
    .references(() => account_emails.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
});

export const account_password_resets = pgTable("passwordReset", {
  id: uuid("id").notNull().primaryKey(),
  accountId: uuid("accountId")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
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

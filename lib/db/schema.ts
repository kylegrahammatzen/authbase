import {
  bigint,
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  smallint,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  user_id: bigint("user_id", { mode: "bigint" }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password_hash: text("password_hash").notNull(),
  is_verified: boolean("is_verified").notNull().default(false),
  failed_logins: integer("failed_logins").notNull().default(0),
  last_failed_login: timestamp("last_failed_login"),
  last_password_change: timestamp("last_password_change"),
});

export const userSessions = pgTable("user_sessions", {
  session_id: uuid("session_id").primaryKey(),
  user_id: bigint("user_id", { mode: "bigint" })
    .references(() => users.user_id)
    .notNull(),
  session_active: boolean("session_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export const userVerifications = pgTable("user_verifications", {
  user_id: bigint("user_id", { mode: "bigint" })
    .primaryKey()
    .references(() => users.user_id),
  verification_code: smallint("verification_code"),
  expires_at: timestamp("expires_at").notNull(),
});

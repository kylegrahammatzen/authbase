"use server";

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { db } from "@/lib/db";
import { accounts, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/lib/auth/utils/jwt";
import { cookies } from "next/headers";

const APP_KEY = String(process.env.APP_KEY);

/**
 * Generates a token
 */
export async function generateToken() {
  const randomBytes = crypto.randomBytes(16);
  const token = randomBytes.toString("hex");

  const hash = crypto.createHmac("sha256", APP_KEY).update(token).digest("hex");

  return hash;
}

/**
 * Creates a new session for a account
 * @param accountId The account id
 * @returns a session
 */
export async function getSession(accountId: string) {
  // Get the user from the database
  const userResponse = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (userResponse.length == 0) {
    return {
      status: "error",
      message: "Account not found",
    };
  }

  console.log("Creating session for account", userResponse[0].id);

  // Generate a new session
  const sessionId = uuidv4();
  const accessToken = await generateToken();
  const refreshToken = await generateToken();

  const createdAt = new Date();
  const accessTokenExpiresAt = new Date(createdAt);

  // Add 1 minute to the access token expiration
  accessTokenExpiresAt.setMinutes(accessTokenExpiresAt.getMinutes() + 1);

  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 7);

  const sessionResponse = await db.insert(sessions).values({
    id: sessionId,
    accountId: accountId,
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiresAt: expiresAt,
    createdAt: createdAt,
    lastActive: createdAt,
  });

  if (sessionResponse == undefined) {
    return {
      status: "error",
      message: "Failed to create session",
    };
  }

  // Sign the session and store it in a cookie
  try {
    const sessionCookie = await signToken({
      id: sessionId,
      accountId: accountId,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      accessTokenExpiresAt: accessTokenExpiresAt,
    });

    // Create cookie
    cookies().set("session", sessionCookie, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return {
      status: "success",
      message: "Session created",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to sign session",
    };
  }
}

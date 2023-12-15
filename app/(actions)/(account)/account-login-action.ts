"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSessions, users } from "@/lib/db/schema";
import { comparePassword } from "@/lib/auth/password";
import { encrypt } from "@/lib/auth/security";
const { v4: uuidv4 } = require("uuid");
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth/auth";

export const loginAccount = async (
  formData: FormData
): Promise<
  | {
      has_error: boolean;
      error_message: string;
      not_verified: boolean;
      state: string;
    }
  | undefined
> => {
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return {
      has_error: true,
      error_message: "Password must be at least 8 characters long.",
      not_verified: false,
      state: "",
    };
  }

  const email = formData.get("email") as string;

  try {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      return {
        has_error: true,
        error_message: "Email is not registered",
        not_verified: false,
        state: "",
      };
    }

    const user = result[0];

    if (!user.is_verified) {
      return {
        has_error: false,
        error_message: "",
        not_verified: true,
        state: encrypt("email=" + email),
      };
    }

    const password_hash = user.password_hash;

    if (!(await comparePassword(password, password_hash))) {
      return {
        has_error: true,
        error_message: "Password is incorrect",
        not_verified: false,
        state: "",
      };
    }

    let cookieDuration;
    const rememberMe = formData.get("remember_me") as string;

    if (rememberMe === "on") {
      cookieDuration = 60 * 60 * 24 * 7; // 1 week
    } else {
      cookieDuration = 60 * 60 * 24; // 1 day
    }

    try {
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + cookieDuration * 1000);

      const result = await db.insert(userSessions).values({
        session_id: sessionId,
        user_id: user.user_id,
        session_active: true,
        expires_at: expiresAt,
      });

      if (result === undefined) {
        return {
          has_error: true,
          error_message: "Something went wrong",
          not_verified: false,
          state: "",
        };
      }

      let cookieData = {
        user_id: user.user_id.toString(),
        session_id: sessionId,
      };

      const token = await signToken(cookieData, rememberMe === "on");

      cookies().set("user-token", token, {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return {
        has_error: false,
        error_message: "",
        not_verified: false,
        state: "",
      };
    } catch (e) {
      console.error("Failed to create session", e);
      return {
        has_error: true,
        error_message: "Something went wrong",
        not_verified: false,
        state: "",
      };
    }
  } catch (e) {
    return {
      has_error: true,
      error_message: "Something went wrong",
      not_verified: false,
      state: "",
    };
  }
};

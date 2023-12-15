"use server";

import { encrypt } from "@/lib/auth/security";
import { Resend } from "resend";
import AuthEmail from "../../(components)/auth/email/EmailTemplate";
import { userVerifications, users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { generateSnowflakeId } from "@/lib/snowflake/snowflake";
import { hashPassword } from "@/lib/auth/password";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export const registerAccount = async (
  formData: FormData
): Promise<
  { has_error: boolean; error_message: string; state: string } | undefined
> => {
  const password = formData.get("password") as string;
  const confirm_password = formData.get("confirm_password") as string;

  // Check if the password has at least 8 characters
  if (password.length < 8) {
    return {
      has_error: true,
      error_message: "Password must be at least 8 characters long.",
      state: "",
    };
  }

  // Check if the password has at least one uppercase character
  if (!/[A-Z]/.test(password)) {
    return {
      has_error: true,
      error_message: "Password must have at least one uppercase character",
      state: "",
    };
  }

  // Check if the password has at least one number
  if (!/[0-9]/.test(password)) {
    return {
      has_error: true,
      error_message: "Password must have at least one number",
      state: "",
    };
  }

  // Check if the passwords match
  if (password !== confirm_password) {
    return {
      has_error: true,
      error_message: "Passwords do not match",
      state: "",
    };
  }

  const email = formData.get("email") as string;

  try {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length > 0) {
      return {
        has_error: true,
        error_message: "Email is already registered",
        state: "",
      };
    }

    const userId = await generateSnowflakeId();
    const code = Math.floor(10000 + Math.random() * (32767 - 10000 + 1));

    const accountTransaction = db.transaction(async (tx) => {
      await db.insert(users).values({
        user_id: userId,
        email: email,
        password_hash: await hashPassword(password),
      });
      await db.insert(userVerifications).values({
        user_id: userId,
        verification_code: code,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
    });

    if (accountTransaction === undefined) {
      return {
        has_error: true,
        error_message: "Something went wrong",
        state: "",
      };
    }

    console.log("User " + userId + " registered");

    try {
      const data = await resend.emails.send({
        from: "ExampleDomain <no-reply@bans.io>",
        to: email,
        subject: "[ExampleDomain] Verify your account",
        html: "",
        react: AuthEmail({ secretCode: `${code}` }),
      });

      // If the email failed to send, return an error
      if (data.error !== null) {
        console.error(data.error);
        return {
          has_error: true,
          error_message: "Could not send email",
          state: "",
        };
      }

      return {
        has_error: false,
        error_message: "",
        state: encrypt("email=" + email),
      };
    } catch (error) {
      console.error(error);
      return {
        has_error: true,
        error_message: "Something went wrong",
        state: "",
      };
    }
  } catch (e) {
    return {
      has_error: true,
      error_message: "Something went wrong",
      state: "",
    };
  }
};

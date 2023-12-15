"use server";

import { db } from "@/lib/db";
import { userVerifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const verifyAccount = async (
  formData: FormData,
  email: string
): Promise<{ has_error: boolean; error_message: string } | undefined> => {
  const digits = [];
  for (let i = 0; i <= 4; i++) {
    const digitInput = formData.get(`code[${i}]`);
    if (digitInput !== null) {
      digits.push(digitInput); // Directly push the integer value
    }
  }

  // Check if the digits are all filled
  if (digits.length !== 5) {
    return {
      has_error: true,
      error_message: "Please fill all the digits",
    };
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return {
        has_error: true,
        error_message: "Email is not registered",
      };
    }

    const user = result[0];

    if (user.is_verified) {
      return {
        has_error: true,
        error_message: "Account is already verified",
      };
    }

    const verification_code = digits.join("");

    const [verification] = await db
      .select()
      .from(userVerifications)
      .where(eq(userVerifications.user_id, user.user_id))
      .limit(1);

    if (verification === undefined) {
      return {
        has_error: true,
        error_message: "Unable to verify account",
      };
    }

    if (verification.verification_code !== Number(verification_code)) {
      return {
        has_error: true,
        error_message: "Verification code is incorrect",
      };
    }

    const now = new Date();

    if (now > verification.expires_at) {
      return {
        has_error: true,
        error_message: "Verification code has expired",
      };
    }

    const updateResult = await db
      .update(users)
      .set({ is_verified: true })
      .where(eq(users.user_id, user.user_id));

    if (updateResult === undefined) {
      return {
        has_error: true,
        error_message: "Unable to verify account",
      };
    }

    return {
      has_error: false,
      error_message: "",
    };
  } catch (error) {
    return {
      has_error: true,
      error_message: "Something went wrong",
    };
  }
};

"use server";

import { comparePassword, hashPassword } from "@/lib/auth/utils/hasher";
import { db } from "@/lib/db";
import { account_emails, accounts, sessions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "./session";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/utils/jwt";
import { redirect } from "next/navigation";
import { LOGIN_CALLBACK_URL } from "@/middleware";

export async function loginAccount(formData: FormData) {
  const email = formData.get("email") as string;

  try {
    // Check if a user with the email exists
    const accountEmailResponse = await db
      .select()
      .from(account_emails)
      .where(and(eq(account_emails.email, email)))
      .limit(1);

    if (accountEmailResponse.length == 0) {
      return {
        status: "error",
        message: "Account not found",
      };
    }

    const accountResponse = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountEmailResponse[0].accountId))
      .limit(1);

    if (accountResponse.length == 0) {
      return {
        status: "error",
        message: "Account not found",
      };
    }

    const password = formData.get("password") as string;

    // Check if the password is correct
    const passwordResponse = await comparePassword(
      password,
      accountResponse[0].password
    );

    if (!passwordResponse) {
      return {
        status: "error",
        message: "Credentials do not match",
      };
    }

    // Create a session for the account
    const sessionResponse = await getSession(accountResponse[0].id);

    if (sessionResponse.status == "error") {
      return {
        status: "error",
        message: "Unable to create account session. Please try again later.",
      };
    }

    return {
      status: "success",
      message: "Account authenticated",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Unable to login. Please try again later.",
    };
  }
}

export async function createAccount(formData: FormData) {
  const password = formData.get("password") as string;

  // Check if the password has at least 8 characters
  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters long",
    };
  }

  // Check if the password has at least one uppercase character
  if (!/[A-Z]/.test(password)) {
    return {
      status: "error",
      message: "Password must have at least one uppercase character",
    };
  }

  // Check if the password has at least one number
  if (!/[0-9]/.test(password)) {
    return {
      status: "error",
      message: "Password must have at least one number",
    };
  }

  const confirmPassword = formData.get("confirmPassword") as string;

  // Check if the passwords match
  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match",
    };
  }

  const email = formData.get("email") as string;

  try {
    // Check if the email is already registered
    const emailResult = await db
      .select()
      .from(account_emails)
      .where(eq(account_emails.email, email));

    if (emailResult.length > 0) {
      return {
        status: "error",
        message: "Email is already registered to an account",
      };
    }

    const name = formData.get("name") as string;
    const accountId = String(uuidv4());
    const accountEmailId = String(uuidv4());

    const createdAt = new Date();

    const accountTransaction = db.transaction(async (tx) => {
      // Create the account
      await tx.insert(accounts).values({
        id: accountId,
        name: name,
        password: await hashPassword(password),
        createdAt: createdAt,
      });

      // Create the account email
      await tx.insert(account_emails).values({
        id: accountEmailId,
        accountId: accountId,
        email: email,
        createdAt: createdAt,
      });
    });

    try {
      await accountTransaction;
    } catch (error) {
      return {
        status: "error",
        message: "Unable to store account information. Please try again later.",
      };
    }

    // Create a session for the account
    const sessionResponse = await getSession(accountId);

    if (sessionResponse.status == "error") {
      return {
        status: "error",
        message:
          "Created account but unable to create session. Please try again later.",
      };
    }

    return {
      status: "success",
      message: "Account created successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Unable to create account. Please try again later.",
    };
  }
}

export async function getAccount() {
  // Get cookie store from request
  const sessionCookie = cookies().get("session");

  // Verify the token from the session cookie
  let userPayload;
  try {
    if (!sessionCookie || !sessionCookie.value) {
      throw new Error("Session cookie is invalid");
    }
    userPayload = await verifyToken(sessionCookie.value);
  } catch (error) {
    redirect(LOGIN_CALLBACK_URL);
  }

  // Retrieve account from database
  const accountResponse = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, userPayload.accountId))
    .limit(1);

  if (accountResponse == undefined) {
    redirect(LOGIN_CALLBACK_URL);
  }

  const account = accountResponse[0];
  const lastActive = new Date();

  // Update the session's lastActive
  const sessionUpdateResponse = await db
    .update(sessions)
    .set({
      lastActive: lastActive,
    })
    .where(eq(sessions.id, userPayload.id));

  if (sessionUpdateResponse == undefined) {
    console.error(
      "Failed to update session lastActive for session id: " + userPayload.id
    );
  }

  return {
    session: {
      id: userPayload.id,
      lastActive: lastActive,
    },
    account: {
      id: account.id,
      name: account.name,
      createdAt: account.createdAt,
    },
  };
}

export async function logoutAccount() {
  cookies().set("session", "", {
    expires: new Date(0),
  });
  redirect(LOGIN_CALLBACK_URL);
}

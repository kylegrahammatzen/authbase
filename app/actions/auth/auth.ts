"use server";

import { comparePassword, hashPassword } from "@/lib/auth/utils/hasher";
import { db } from "@/lib/db";
import {
  account_emails,
  account_verifications,
  accounts,
  sessions,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "./session";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/utils/jwt";
import { redirect } from "next/navigation";
import { LOGIN_CALLBACK_URL } from "@/middleware";

export type AccountState = {
  accountId: string;
  email: string;
};

export type AccountEmailCode = {
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
};

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

    // Check if the email is verified
    if (!accountEmailResponse[0].verified) {
      return {
        status: "unverified",
        message: "Verify email to login",
        account: {
          id: accountResponse[0].id,
          email: accountEmailResponse[0].email,
        },
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
    const accountEmailVerificationId = String(uuidv4());

    const createdAt = new Date();

    // Generate a random 5 digit code
    const code = Math.floor(10000 + Math.random() * 90000);

    // Email verification code expires at date + 1 day
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

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
        isPrimary: true,
        createdAt: createdAt,
      });

      // Create the account email verification
      await tx.insert(account_verifications).values({
        id: accountEmailVerificationId,
        accountId: accountId,
        accountEmailId: accountEmailId,
        code: code,
        expiresAt: expiresAt,
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

    return {
      status: "success",
      message: "Account created",
      account: {
        id: accountId,
        email: email,
      },
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

export async function verifyAccountEmail(
  codeArray: number[],
  accountState: AccountState
) {
  // Check if the user exists
  const accountResponse = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountState.accountId))
    .limit(1);

  if (accountResponse.length == 0) {
    return {
      status: "error",
      message: "Account not found",
    };
  }

  // Check if the email is already verified
  const accountEmailResponse = await db
    .select()
    .from(account_emails)
    .where(
      and(
        eq(account_emails.accountId, accountState.accountId),
        eq(account_emails.email, accountState.email)
      )
    )
    .limit(1);

  if (accountEmailResponse.length == 0) {
    return {
      status: "error",
      message: "Email not found",
    };
  }

  if (accountEmailResponse[0].verified) {
    return {
      status: "error",
      message: "Email is already verified",
    };
  }

  // Check if the verification code matches
  const code = parseInt(codeArray.join(""));

  const verificationResponse = await db
    .select()
    .from(account_verifications)
    .where(
      and(
        eq(account_verifications.accountId, accountState.accountId),
        eq(account_verifications.accountEmailId, accountEmailResponse[0].id),
        eq(account_verifications.code, code)
      )
    )
    .limit(1);

  if (verificationResponse.length == 0) {
    return {
      status: "error",
      message: "Verification code is incorrect",
    };
  }

  // Update the email verification to verified & verificationTimestamp
  const verificationUpdateResponse = await db
    .update(account_emails)
    .set({
      verified: true,
      verificationTimestamp: new Date(),
    })
    .where(eq(account_emails.id, accountEmailResponse[0].id));

  if (verificationUpdateResponse == undefined) {
    return {
      status: "error",
      message: "Unable to update email verification",
    };
  }

  return {
    status: "success",
    message: "Email verified",
  };
}

export async function resendAccountEmailVerification(
  accountState: AccountState
) {
  // Get the account email
  const accountEmailResponse = await db
    .select()
    .from(account_emails)
    .where(
      and(
        eq(account_emails.accountId, accountState.accountId),
        eq(account_emails.email, accountState.email)
      )
    )
    .limit(1);

  if (accountEmailResponse.length == 0) {
    return {
      status: "error",
      message: "Email not found",
    };
  }

  // Check if the email is already verified
  if (accountEmailResponse[0].verified) {
    return {
      status: "error",
      message: "Email is already verified",
    };
  }

  // Retrieve the latest  verification code for the account email's id
  const verificationResponse = await db
    .select()
    .from(account_verifications)
    .where(eq(account_verifications.accountEmailId, accountEmailResponse[0].id))
    .orderBy(desc(account_verifications.expiresAt))
    .limit(1);

  if (verificationResponse.length == 0) {
    return {
      status: "error",
      message: "Verification code not found",
    };
  }

  // Check if the last verification code was sent less than 5 minutes ago
  const difference = Math.floor(
    (Date.now() - verificationResponse[0].expiresAt.getTime()) / 1000
  );

  if (difference < 300) {
    return {
      status: "error",
      message:
        "Please wait a bit longer! You've already received a verification code less than 5 minutes ago.",
    };
  }

  // Create a new verification code
  const code = Math.floor(10000 + Math.random() * 90000);

  // Verification code expires at date + 1 day
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  // Update the last verification code to expired & make the new one
  const verificationTransaction = db.transaction(async (tx) => {
    await tx.update(account_verifications).set({
      expiresAt: new Date(),
    });

    await tx.insert(account_verifications).values({
      id: String(uuidv4()),
      accountId: accountState.accountId,
      accountEmailId: accountEmailResponse[0].id,
      code: code,
      expiresAt: expiresAt,
    });
  });

  try {
    await verificationTransaction;
  } catch (error) {
    return {
      status: "error",
      message: "Unable to resend verification code",
    };
  }

  return {
    status: "success",
    message: "Verification code sent",
  };
}

export async function getAccountSession(accountState: AccountState) {
  // Create a session for the account
  const sessionResponse = await getSession(accountState.accountId);

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
}

export async function resetAccountPassword(formData: FormData) {
  // Check if the email is registered
  const email = formData.get("email") as string;

  const accountEmailResponse = await db
    .select()
    .from(account_emails)
    .where(eq(account_emails.email, email))
    .limit(1);

  if (accountEmailResponse.length == 0) {
    return {
      status: "error",
      message: "Email not found",
    };
  }

  // Retrieve the account
  const accountResponse = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountEmailResponse[0].accountId))
    .limit(1);

  if (accountResponse.length == 0) {
    return {
      status: "error",
      message: "Account could not be retrieved",
    };
  }

  return {
    status: "error",
    message: "Not implemented",
  };
}

export async function logoutAccount() {
  cookies().set("session", "", {
    expires: new Date(0),
  });
  redirect(LOGIN_CALLBACK_URL);
}

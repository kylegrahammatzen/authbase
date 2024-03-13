import { generateToken } from "@/app/actions/auth/session";
import { signToken, verifyToken } from "@/lib/auth/utils/jwt";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const AUTH_KEY = String(process.env.AUTH_KEY);

export async function verifySession(session: string) {
  try {
    return await verifyToken(session);
  } catch (error) {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  let authorizationHeader = request.headers.get("X-Auth-Key");

  if (!authorizationHeader) {
    return NextResponse.json({
      status: "error",
      message: "No authorization header found",
    });
  }

  if (authorizationHeader !== AUTH_KEY) {
    return NextResponse.json({
      status: "error",
      message: "Invalid authorization header",
    });
  }

  const sessionCookie = request.headers.get("Cookie");

  if (!sessionCookie) {
    return NextResponse.json({
      status: "error",
      message: "No session cookie found",
    });
  }

  const session = await verifySession(sessionCookie);

  if (!session) {
    return NextResponse.json({
      status: "error",
      message: "Invalid session cookie",
    });
  }

  // Check if the session expiresAt (minus 5 minutes) is less than the current time
  const sessionExpiration = new Date(session.expiresAt);
  const currentTime = new Date();
  const timeDifference = sessionExpiration.getTime() - currentTime.getTime();

  if (timeDifference < 300000) {
    return NextResponse.json({
      status: "expired",
      message: "Session cookie has expired",
    });
  }

  // Check if the session's accessTokenExpiresAt (or value minus 30 seconds) is less than the current time
  const accessTokenExpiration = new Date(session.accessTokenExpiresAt);
  const accessTokenTimeDifference =
    accessTokenExpiration.getTime() - currentTime.getTime();

  if (
    accessTokenExpiration < currentTime ||
    accessTokenTimeDifference < 30000
  ) {
    return NextResponse.json({
      status: "expired",
      message: "Access token has expired",
    });
  }

  // Check if the session's access token matches the one in the database
  const sessionResponse = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, session.id),
        eq(sessions.accountId, session.accountId)
      )
    )
    .limit(1);

  if (sessionResponse === undefined || sessionResponse.length === 0) {
    return NextResponse.json({
      status: "error",
      message: "Session could not be found",
    });
  }

  const sessionData = sessionResponse[0];
  if (sessionData.accessToken !== session.accessToken) {
    return NextResponse.json({
      status: "error",
      message: "Session access token does not match",
    });
  }

  return NextResponse.json({
    status: "success",
    message: "Session verified",
  });
}

export async function PUT(request: NextRequest) {
  let authorizationHeader = request.headers.get("X-Auth-Key");

  if (!authorizationHeader) {
    return NextResponse.json({
      status: "error",
      message: "No authorization header found",
    });
  }

  if (authorizationHeader !== AUTH_KEY) {
    return NextResponse.json({
      status: "error",
      message: "Invalid authorization header",
    });
  }

  const sessionCookie = request.headers.get("Cookie");

  // Check if the session cookie or its value is missing and return an error
  if (!sessionCookie) {
    return NextResponse.json({
      status: "error",
      message: "No session cookie found",
    });
  }

  const session = await verifySession(sessionCookie);

  if (!session) {
    return NextResponse.json({
      status: "error",
      message: "Invalid session cookie",
    });
  }

  const sessionId = session.id;
  const sessionAccountId = session.accountId;
  const sessionRefreshToken = session.refreshToken;

  // Check to see if the session's refresh token was revoked
  const sessionRevokedResponse = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.id, sessionId), eq(sessions.accountId, sessionAccountId))
    )
    .limit(1);

  if (
    sessionRevokedResponse === undefined ||
    sessionRevokedResponse.length === 0
  ) {
    return NextResponse.json({
      status: "error",
      message: "Session could not be found",
    });
  }

  // Check if the session's refresh token matches the one in the database
  if (sessionRevokedResponse[0].refreshToken !== sessionRefreshToken) {
    return NextResponse.json({
      status: "error",
      message: "Session refresh token does not match",
    });
  }

  // Generate a new access token
  const accessToken = await generateToken();
  const refreshToken = await generateToken();

  const accessTokenExpiresAt = new Date();
  accessTokenExpiresAt.setMinutes(accessTokenExpiresAt.getMinutes() + 15);

  const updateSessionResponse = await db
    .update(sessions)
    .set({
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
    .where(eq(sessions.id, sessionId));

  if (updateSessionResponse === undefined) {
    return NextResponse.json({
      status: "error",
      message: "Failed to update session's tokens",
    });
  }

  try {
    const sessionCookie = await signToken({
      id: sessionId,
      accountId: sessionAccountId,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: session.expiresAt,
      accessTokenExpiresAt: accessTokenExpiresAt,
    });

    return NextResponse.json({
      status: "refreshed",
      message: "Session refreshed",
      cookie: sessionCookie,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to refresh session",
    });
  }
}

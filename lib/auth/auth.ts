import { db } from "@/lib/db";
import { userSessions } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not set");
}

interface Session {
  user_id: bigint;
}

interface SessionResponse {
  session?: Session;
}

interface TokenPayload {
  user_id: string;
  session_id: string;
  [key: string]: any;
}

async function verifyToken(token: string): Promise<TokenPayload> {
  const result = await jwtVerify(
    token,
    new TextEncoder().encode(JWT_SECRET_KEY)
  );
  return result.payload as TokenPayload;
}

export async function signToken(
  payload: Record<string, any>,
  rememberMe: boolean
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "14d" : "1d")
    .sign(new TextEncoder().encode(JWT_SECRET_KEY));
}

async function fetchSession(userId: bigint, sessionId: string) {
  return db
    .select()
    .from(userSessions)
    .where(sql`${userId} = user_id AND ${sessionId} = session_id`)
    .execute();
}

export async function getUserSession(): Promise<SessionResponse> {
  const token = cookies().get("user-token")?.value;
  if (!token) {
    redirect("/auth/login");
  }

  try {
    const payload = await verifyToken(token);
    const userId = BigInt(payload.user_id);
    const sessionId = payload.session_id;

    const session = await fetchSession(userId, sessionId);

    if (
      session.length === 0 ||
      !session[0].session_active ||
      new Date() > new Date(session[0].expires_at)
    ) {
      await db
        .delete(userSessions)
        .where(sql`${userId} = user_id AND ${sessionId} = session_id`);
      redirect("/auth/login");
    }

    return { session: { user_id: userId } };
  } catch (error) {
    redirect("/auth/login");
  }
}

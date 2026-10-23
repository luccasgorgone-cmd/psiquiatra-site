import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers } from "./db/schema";
import { eq } from "drizzle-orm";
import { authSecret as secret, ADMIN_AUDIENCE } from "./auth-secret";

const COOKIE = "psi_session";

export type SessionUser = { id: string; email: string; name: string };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setAudience(ADMIN_AUDIENCE)
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { audience: ADMIN_AUDIENCE });
    if (payload.role !== "admin") return null;
    return { id: payload.id as string, email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

export async function verifyCredentials(email: string, password: string) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name } satisfies SessionUser;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

/** Verifica um JWT de admin (assinatura + audiência + role). */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, { audience: ADMIN_AUDIENCE });
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;

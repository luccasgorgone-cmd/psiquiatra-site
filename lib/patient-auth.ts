import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { patients } from "./db/schema";
import { eq } from "drizzle-orm";

const COOKIE = "psi_patient";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export type PatientSession = { id: string; name: string; email: string };

export async function createPatientSession(p: PatientSession) {
  const token = await new SignJWT({ ...p, role: "patient" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyPatientSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getPatientSession(): Promise<PatientSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "patient") return null;
    return { id: payload.id as string, name: payload.name as string, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function verifyPatientCredentials(email: string, password: string) {
  const [p] = await db
    .select()
    .from(patients)
    .where(eq(patients.email, email.toLowerCase().trim()))
    .limit(1);
  if (!p || !p.password || !p.active) return null;
  const ok = await bcrypt.compare(password, p.password);
  if (!ok) return null;
  return { id: p.id, name: p.name, email: p.email } satisfies PatientSession;
}

export async function hashPatientPassword(password: string) {
  return bcrypt.hash(password, 10);
}

/** Exige sessão de paciente (para server actions do portal). */
export async function requirePatient(): Promise<PatientSession> {
  const s = await getPatientSession();
  if (!s) throw new Error("Não autorizado");
  return s;
}

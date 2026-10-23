import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { authSecret as secret, ADMIN_AUDIENCE, PATIENT_AUDIENCE } from "./lib/auth-secret";

function hostOf(req: NextRequest) {
  const h = req.headers.get("host") || req.nextUrl.host || "";
  return h.toLowerCase().split(":")[0];
}

async function tokenValid(
  token: string | undefined,
  opts?: { role?: string; audience?: string }
) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      secret,
      opts?.audience ? { audience: opts.audience } : undefined
    );
    if (opts?.role && payload.role !== opts.role) return false;
    return true;
  } catch {
    return false;
  }
}

/** Token de admin: assinatura + audiência admin + role admin. */
function adminTokenValid(token: string | undefined) {
  return tokenValid(token, { role: "admin", audience: ADMIN_AUDIENCE });
}

async function guardAdmin(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await adminTokenValid(req.cookies.get("psi_session")?.value))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  return null;
}

async function guardPatient(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const openRoutes = ["/paciente/login", "/paciente/cadastro"];
  if (pathname.startsWith("/paciente") && !openRoutes.includes(pathname)) {
    if (!(await tokenValid(req.cookies.get("psi_patient")?.value, { role: "patient", audience: PATIENT_AUDIENCE }))) {
      const url = req.nextUrl.clone();
      url.pathname = "/paciente/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminHost = (process.env.ADMIN_HOST || "").toLowerCase().trim();
  const host = hostOf(req);

  if (!adminHost) {
    return (await guardAdmin(req)) ?? (await guardPatient(req)) ?? NextResponse.next();
  }

  if (host === adminHost) {
    if (path === "/") {
      const url = req.nextUrl.clone();
      url.pathname = (await adminTokenValid(req.cookies.get("psi_session")?.value)) ? "/admin" : "/admin/login";
      return NextResponse.rewrite(url);
    }
    if (!path.startsWith("/admin") && !path.startsWith("/api")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return (await guardAdmin(req)) ?? NextResponse.next();
  }

  // Domínio público
  if (path.startsWith("/admin")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return (await guardPatient(req)) ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

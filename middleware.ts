import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

function hostOf(req: NextRequest) {
  const h = req.headers.get("host") || req.nextUrl.host || "";
  return h.toLowerCase().split(":")[0];
}

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get("psi_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function guardAdmin(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await isAuthed(req))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
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

  // Sem ADMIN_HOST configurado: comportamento padrão (admin no mesmo domínio).
  if (!adminHost) {
    return (await guardAdmin(req)) ?? NextResponse.next();
  }

  const onAdminDomain = host === adminHost;

  if (onAdminDomain) {
    // Domínio do painel: tudo aponta para /admin. Site público fica indisponível aqui.
    if (path === "/") {
      // Rewrite não re-executa o middleware, então validamos o login aqui.
      const url = req.nextUrl.clone();
      url.pathname = (await isAuthed(req)) ? "/admin" : "/admin/login";
      return NextResponse.rewrite(url);
    }
    if (!path.startsWith("/admin") && !path.startsWith("/api")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return (await guardAdmin(req)) ?? NextResponse.next();
  }

  // Domínio público: /admin fica escondido (404). APIs continuam liberadas.
  if (path.startsWith("/admin")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Roda em tudo, exceto assets estáticos do Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

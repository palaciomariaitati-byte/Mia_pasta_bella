import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorar assets internos, api routes estáticas e imágenes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Bypass si está explícitamente deshabilitado para testing
  if (process.env.ADMIN_AUTH_DISABLED === "true") {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("mpb_admin_session")?.value;
  const isLoginPage = pathname === "/login";

  // Si no está autenticado y no está en /login -> redirigir a /login
  if (!sessionCookie && !isLoginPage) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya tiene sesión activa y navega a /login -> redirigir al panel principal
  if (sessionCookie && isLoginPage) {
    const dashboardUrl = new URL("/", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

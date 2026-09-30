import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

const PUBLIC_ADMIN_PATHS = [
  "/administracion/ingresar",
  "/administracion/verificar",
];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/quality-pulse/admin");

  if (!isApiRoute && isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) {
    return NextResponse.next();
  }

  if (isApiRoute) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const loginUrl = new URL("/administracion/ingresar", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/administracion/:path*", "/api/quality-pulse/admin/:path*"],
};

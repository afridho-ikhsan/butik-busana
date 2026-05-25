import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const urlOrigin = request.nextUrl.origin;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/user")) {
    if (!token) {
      return NextResponse.redirect(`${urlOrigin}/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(`${urlOrigin}/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    const role = token.role as string | undefined;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.redirect(urlOrigin);
    }
  }

  return NextResponse.next();
};
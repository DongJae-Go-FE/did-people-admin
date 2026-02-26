import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  if (pathname.startsWith("/") && !pathname.startsWith("//") && !pathname.includes(":")) {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return redirectToLogin(request, pathname);
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return redirectToLogin(request, pathname);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    const response = redirectToLogin(request, pathname);
    response.cookies.delete("accessToken");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // /members 하위 전체 + 그 외 인증 필요 경로
  matcher: ["/members/:path*"],
};

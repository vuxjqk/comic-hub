import { NextRequest, NextResponse } from "next/server";

import { authenticate, redirectWithHeaders } from "./lib/middleware";

const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];
const adminRoutes = ["/admin"];

export const middleware = async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const payload = await authenticate(accessToken, refreshToken, response);

  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (payload) {
    if (isAuthRoute) {
      return redirectWithHeaders(request, response, "/");
    }

    if (
      !payload.isEmailVerified &&
      pathname !== "/verify-email" &&
      pathname !== "/profile"
    ) {
      return redirectWithHeaders(request, response, "/verify-email");
    }

    if (payload.isEmailVerified && pathname === "/verify-email") {
      return redirectWithHeaders(request, response, "/");
    }

    if (payload.role === "CUSTOMER" && pathname !== "/403" && isAdminRoute) {
      return redirectWithHeaders(request, response, "/403");
    }

    return response;
  }

  if (isAuthRoute || pathname === "/403") {
    return response;
  }

  const callbackUrl = `${pathname}${search}`;
  const signInPath = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  return redirectWithHeaders(request, response, signInPath);
};

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/verify-email",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/403",
  ],
};

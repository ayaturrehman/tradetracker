import { NextResponse } from "next/server";

import { auth } from "@/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/api/webhooks/stripe",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isPublic = PUBLIC_PATHS.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const session = req.auth;
  const isLoggedIn = Boolean(session?.user);

  if (!isLoggedIn) {
    const redirectUrl = new URL("/login", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (nextUrl.pathname.startsWith("/admin")) {
    const role = session?.user?.role ?? "USER";
    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/analytics/:path*",
    "/journal/:path*",
    "/billing",
    "/admin/:path*",
  ],
};

import { NextRequest } from "next/server";
import { initAuthbase } from "./lib/auth/authbase";

export const LOGIN_CALLBACK_URL = "/protected";
export const LOGOUT_CALLBACK_URL = "/sign-in";

// Configuration for Authbase
const authbase = initAuthbase({
  // Add publicRoutes as needed
  // publicRoutes: ["/sign-in", "/sign-up"],
  privateRoutes: ["/protected"],
});

export async function middleware(request: NextRequest) {
  return await authbase.handleRequest(request);
}

// Next.js routing configuration for excluding specific routes
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { LOGOUT_CALLBACK_URL } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

const AUTH_KEY = process.env.AUTH_KEY;

/**
 * Authbase configuration settings.
 */
export type AuthbaseConfig = {
  publicRoutes?: string[];
  privateRoutes?: string[];
};

/**
 * Initializes Authbase with specified configuration.
 * @param config Configuration settings for Authbase.
 * @returns Instance of Authbase.
 */
export function initAuthbase(config: AuthbaseConfig): Authbase {
  return new Authbase(config);
}

/**
 * Authbase class for handling authentication.
 */
class Authbase {
  private readonly publicRoutes: string[];
  private readonly privateRoutes: string[];

  constructor(config: AuthbaseConfig) {
    this.publicRoutes = config.publicRoutes ?? [];
    this.privateRoutes = config.privateRoutes ?? [];
  }

  /**
   * Middleware for authenticating requests.
   * @param request Incoming request object.
   * @returns NextResponse or void based on authentication status.
   */
  async handleRequest(request: NextRequest): Promise<NextResponse | void> {
    const path = request.nextUrl.pathname;

    const routeType = this.getRouteType(path);

    if (routeType == "private") {
      const authenticated = await this.verifySession(request);

      if (!authenticated) {
        const newUrl = `${LOGOUT_CALLBACK_URL}?callbackUrl=${request.nextUrl}`;
        return NextResponse.redirect(new URL(newUrl, request.url));
      }

      return authenticated;
    } else if (routeType == "public") {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  private getRouteType(url: string): "public" | "private" | "none" {
    if (this.checkRoute(url, this.privateRoutes)) {
      return "private";
    } else if (this.checkRoute(url, this.publicRoutes)) {
      return "public";
    }
    return "none";
  }

  private checkRoute(url: string, routes: string[]) {
    return routes.some((route) => url === route || url.startsWith(route));
  }

  private async verifySession(
    request: NextRequest
  ): Promise<NextResponse | undefined> {
    if (!request.cookies.has("session")) {
      return undefined;
    }

    const sessionCookie = request.cookies.get("session");
    const sessionValue = sessionCookie?.value;

    if (!sessionValue) {
      return undefined;
    }

    let sessionResponse = NextResponse.next();

    let session = await this.fetchSession(
      "http://localhost:3000/api/auth/session",
      "GET",
      sessionCookie.value
    );

    if (session.status === "expired") {
      session = await this.fetchSession(
        "http://localhost:3000/api/auth/session",
        "PUT",
        sessionCookie.value
      );

      if (session.status === "refreshed") {
        sessionResponse.cookies.set("session", session.cookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }
    }

    return session.status === "success" || session.status === "refreshed"
      ? sessionResponse
      : undefined;
  }

  private async fetchSession(
    url: string,
    method: "GET" | "PUT",
    cookieValue: string
  ): Promise<any> {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Key": String(AUTH_KEY),
        Cookie: cookieValue,
      },
      cache: "no-store",
    });
    return response.json();
  }
}

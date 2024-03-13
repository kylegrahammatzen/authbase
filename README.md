# authbase

**Plug-and-play email/password authentication in Next.js 14 apps**

This repository contains the minimal version of `authbase`, a straightforward solution for integrating email/password authentication into Next.js 14 applications, without the complexity of email verification found in the master branch. It's designed with Next.js 14, Tailwind CSS, and Drizzle ORM using PostgreSQL to offer a quick and efficient way to add authentication to your projects.

## Features

- **Session management:** Sessions include access and refresh tokens. Access tokens expire every 15 minutes and are automatically regenerated along with a new refresh token. Sessions last a maximum of 7 days (configurable).
- **Sign in/sign up forms:** Provides pages for account creation and access, enabling testing of private routes.

## Notes

- **No cooldown on account creation:** Currently, there's no limitation on account creation rates. This is important to consider for production environments, where implementing a cooldown might be necessary to prevent abuse.

# Quick Start

To get started with `authbase`, clone this repository and install the dependencies:

```bash
git clone https://github.com/kylegrahammatzen/authbase.git -b minimal
cd authbase
```

Install the dependencies:

```bash
npm install
```

## Environment Setup

Before running the application, you'll need to set up your environment variables:

1. Rename `.env.local.example` to `.env.local`.
2. Fill in the `DATABASE_URL` with your PostgreSQL database URL.
3. Generate two authentication keys (for `APP_KEY` and `AUTH_KEY`) using https://generate-secret.vercel.app/32.

## Database Schema

Before starting, ensure your PostgreSQL database is running, then push the schema to your database:

```bash
npm run db:push
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Go to http://localhost:3000 to test **Authbase**'s minimal version.

## Custom Middleware Configuration

You can configure custom middleware for route handling and authentication flow control as follows:

```typescript
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
```

This setup allows you to easily define private and optionally public routes, providing a flexible authentication system for your Next.js applications.

Feel free to clone, modify, and use this project as a base for your authentication needs in Next.js applications. Enjoy building secure and scalable web applications with **Authbase**.

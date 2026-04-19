import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { 
  BetterErrorSchema, 
  BetterLoginSchema, 
  BetterLogoutResponseSchema, 
  BetterRegisterSchema, 
  BetterUserResponseSchema 
} from "./better-auth-schema";
import { auth } from "../../lib/auth";
import type { Context } from "hono";

const tags = ["better-auth"];

export const betterAuthRoute = new OpenAPIHono();

/**
 * Helper to proxy requests to Better Auth handler while handling 'Body already used' errors
 * caused by Hono's OpenAPI validation.
 */
async function handleBetterAuth(c: Context): Promise<any> {
  const method = c.req.method;
  const isPost = method === "POST" || method === "PUT" || method === "PATCH";
  
  if (isPost && c.req.raw.bodyUsed) {
    // If body is already used, it's likely because of a validator.
    // We try to reconstruct the request using the validated JSON data.
    try {
      const data = (c.req as any).valid("json");
      const newReq = new Request(c.req.raw.url, {
        method: c.req.raw.method,
        headers: c.req.raw.headers,
        body: JSON.stringify(data),
      });
      return auth.handler(newReq);
    } catch (e) {
      // If validation data is not found or not JSON, fallback to raw request (might fail if body is truly gone)
      console.warn("[Better Auth Proxy] Body used but no validated JSON found. Falling back to raw request.");
    }
  }
  
  return auth.handler(c.req.raw);
}

// POST /auth/sign-in/email
betterAuthRoute.openapi(
  createRoute({
    method: "post",
    path: "/sign-in/email",
    tags,
    request: { body: { content: { "application/json": { schema: BetterLoginSchema } } } },
    responses: {
      200: { description: "Login successful", content: { "application/json": { schema: BetterUserResponseSchema } } },
      401: { description: "Invalid credentials", content: { "application/json": { schema: BetterErrorSchema, example: { message: "Invalid credentials" } } } },
      500: { description: "Failed to login", content: { "application/json": { schema: BetterErrorSchema, example: { message: "Failed to login" } } } },
    },
  }),
  (c) => handleBetterAuth(c) as any
);

// POST /auth/sign-up/email
betterAuthRoute.openapi(
  createRoute({
    method: "post",
    path: "/sign-up/email",
    tags,
    request: { body: { content: { "application/json": { schema: BetterRegisterSchema } } } },
    responses: {
      201: { description: "User registered successfully", content: { "application/json": { schema: BetterUserResponseSchema } } },
      409: { description: "User already exists", content: { "application/json": { schema: BetterErrorSchema, example: { message: "User already exists" } } } },
      500: { description: "Failed to register", content: { "application/json": { schema: BetterErrorSchema, example: { message: "Failed to register" } } } },
    },
  }),
  (c) => handleBetterAuth(c) as any
);

// POST /auth/sign-out/email (Custom path requested)
betterAuthRoute.openapi(
  createRoute({
    method: "post",
    path: "/sign-out/email",
    tags,
    responses: {
      200: { description: "Logout successful", content: { "application/json": { schema: BetterLogoutResponseSchema, example: { success: true } } } },
      500: { description: "Failed to logout", content: { "application/json": { schema: BetterErrorSchema, example: { message: "Failed to logout" } } } },
    },
  }),
  async (c) => {
    // Better Auth expects /sign-out, so we rewrite the URL for the handler if hit via this custom documentation path
    const url = new URL(c.req.url);
    if (url.pathname.endsWith("/sign-out/email")) {
      url.pathname = url.pathname.replace("/sign-out/email", "/sign-out");
    }
    const newReq = new Request(url.toString(), {
      method: c.req.raw.method,
      headers: c.req.raw.headers,
    });
    return auth.handler(newReq) as any;
  }
);

// POST /auth/sign-out (Standard Better Auth path)
betterAuthRoute.openapi(
  createRoute({
    method: "post",
    path: "/sign-out",
    tags,
    responses: {
      200: { description: "Logout successful", content: { "application/json": { schema: BetterLogoutResponseSchema, example: { success: true } } } },
      500: { description: "Failed to logout", content: { "application/json": { schema: BetterErrorSchema, example: { message: "Failed to logout" } } } },
    },
  }),
  (c) => handleBetterAuth(c) as any
);

// POST /auth/sign-in/social
betterAuthRoute.openapi(
  createRoute({
    method: "post",
    path: "/sign-in/social",
    tags,
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              provider: z.enum(["google"]),
              callbackURL: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: "Social login initiated", content: { "application/json": { schema: z.object({ url: z.string() }) } } },
      500: { description: "Failed to initiate social login" },
    },
  }),
  (c) => handleBetterAuth(c) as any
);

// GET /auth/get-session
betterAuthRoute.openapi(
  createRoute({
    method: "get",
    path: "/get-session",
    tags,
    responses: {
      200: { description: "Get Session Token", content: { "application/json": { schema: BetterUserResponseSchema } } },
      401: { description: "Unauthenticated" },
    },
  }),
  (c) => handleBetterAuth(c) as any
);

// Final catch-all for Better Auth sub-app to handle internal routes (callback, etc.)
betterAuthRoute.all("/*", (c) => handleBetterAuth(c));

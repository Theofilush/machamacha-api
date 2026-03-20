import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import {
  AuthResponseSchema,
  BearerTokenSchema,
  ErrorSchema,
  JWTPayloadSchema,
  LoginSchema,
  LogoutResponseSchema,
  RefreshRequestSchema,
  RefreshTokenResponseSchema,
  RegisterSchema,
  UserMeResponseSchema,
  UserResponseSchema,
} from "./schema";
import { verify } from "hono/jwt";
import { exampleRequestRegister, exampleResponseLogin, exampleResponseRegister } from "./payload-example";
import { checkAuthorized, hashPassword, verifyPassword, verifyToken } from "../../lib/auth";
import { addDays } from "../../lib/date";
import { signAccessToken, signRefreshToken } from "../../lib/auth";

const tags = ["authentication"];

export const authRoute = new OpenAPIHono();

// POST /auth/login
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags,
    request: { body: { content: { "application/json": { schema: LoginSchema } } } },
    responses: {
      200: { description: "Login successful", content: { "application/json": { schema: AuthResponseSchema, example: exampleResponseLogin } } },
      401: { description: "Invalid credentials", content: { "application/json": { schema: ErrorSchema, example: { error: "Invalid credentials" } } } },
      500: { description: "Failed to login", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to login" } } } },
    },
  }),
  async (c) => {
    try {
      const { email, password } = await c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: { email },
        include: { password: true },
      });

      if (!user || !user.password) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const isValid = await verifyPassword(user.password.hash, password);
      if (!isValid) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const accessToken = await signAccessToken({ userId: user.id, email: user.email });
      const refreshToken = await signRefreshToken({ userId: user.id });

      await prisma.refreshToken.upsert({
        where: { userId: user.id },
        update: {
          token: refreshToken,
          expiresAt: addDays(new Date(), 7),
        },
        create: {
          token: refreshToken,
          userId: user.id,
          expiresAt: addDays(new Date(), 7),
        },
      });

      return c.json({ accessToken: accessToken, refreshToken, user: { id: user.id, email: user.email } }, 200);
    } catch (err) {
      console.error("Error login:", err);
      return c.json({ error: "Failed to login" }, 500);
    }
  },
);

// POST /auth/register
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/register",
    tags,
    request: { body: { content: { "application/json": { schema: RegisterSchema, example: exampleRequestRegister } } } },
    responses: {
      201: { description: "User registered successfully", content: { "application/json": { schema: UserResponseSchema, example: exampleResponseRegister } } },
      409: { description: "User already exists", content: { "application/json": { schema: ErrorSchema, example: { error: "User already exists" } } } },
      500: { description: "Failed to register", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to register" } } } },
    },
  }),
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({ error: "User already exists" }, 409);
      }

      const hash = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: { create: { hash } },
        },
      });

      return c.json({ id: newUser.id, email: newUser.email }, 201);
    } catch (err) {
      console.error("Error register:", err);
      return c.json({ error: "Failed to register" }, 500);
    }
  },
);

// POST /auth/logout
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/logout",
    tags,
    responses: {
      200: { description: "Logout successful", content: { "application/json": { schema: LogoutResponseSchema, example: { message: "Logout successful" } } } },
      400: { description: "No token provided", content: { "application/json": { schema: ErrorSchema, example: { error: "No token provided" } } } },
      401: { description: "Invalid or expired token", content: { "application/json": { schema: ErrorSchema, example: { error: "Invalid or expired token" } } } },
      500: { description: "Failed to logout", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to logout" } } } },
    },
  }),
  async (c) => {
    try {
      const token = c.req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return c.json({ error: "No token provided" }, 400);
      }

      const isLoggedOut = await prisma.invalidToken.findUnique({ where: { token } });
      if (isLoggedOut) {
        return c.json({ message: "Already logged out" }, 200);
      }
      let rawPayload;
      try {
        rawPayload = await verifyToken(token);
      } catch {
        return c.json({ error: "Invalid or expired token" }, 401);
      }

      const payload = JWTPayloadSchema.parse(rawPayload);

      await prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });

      await prisma.invalidToken.create({ data: { token } });

      return c.json({ message: "Logout successful" }, 200);
    } catch (err) {
      console.error("Error logout:", err);
      return c.json({ error: "Failed to logout" }, 500);
    }
  },
);

// POST /auth/refresh-token
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/refresh-token",
    tags,
    request: { body: { content: { "application/json": { schema: RefreshRequestSchema, example: { refreshToken: "refresh.token.here" } } } } },
    responses: {
      200: { description: "New access token issued", content: { "application/json": { schema: RefreshTokenResponseSchema, example: { token: "new.jwt.token.here" } } } },
      401: { description: "Invalid or expired refresh token", content: { "application/json": { schema: ErrorSchema, example: { error: "Invalid refresh token" } } } },
      500: { description: "Failed to refresh token", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to refresh token" } } } },
    },
  }),
  async (c) => {
    try {
      const { refreshToken } = await c.req.valid("json");

      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!stored || stored.expiresAt < new Date()) {
        return c.json({ error: "Invalid or expired refresh token" }, 401);
      }

      const newAccessToken = await signRefreshToken({ userId: stored.userId });

      return c.json({ token: newAccessToken }, 200);
    } catch (err) {
      console.error("Error refresh:", err);
      return c.json({ error: "Failed to refresh token" }, 500);
    }
  },
);

// GET /auth/me
authRoute.openapi(
  createRoute({
    method: "get",
    path: "/me",
    middleware: checkAuthorized,
    tags,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: "Get user profile", content: { "application/json": { schema: UserMeResponseSchema, example: { id: "user-id", email: "[EMAIL_ADDRESS]" } } } },
      401: {
        description: "Authorization header not provided or invalid",
        content: { "application/json": { schema: ErrorSchema, example: { error: "Authorization header not provided or invalid" } } },
      },
      500: { description: "Failed to get user profile", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to get user profile" } } } },
    },
  }),
  async (c) => {
    try {
      const user = c.get("user");

      return c.json(user, 200);
    } catch (err) {
      console.error("Error me:", err);
      return c.json({ error: "Failed to get user profile" }, 500);
    }
  },
);

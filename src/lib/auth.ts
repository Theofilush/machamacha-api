import * as argon2 from "argon2";
import { sign, verify } from "hono/jwt";
import { createFactory } from "hono/factory";
import { JWTPayloadSchema, UserMeResponseSchema } from "../modules/auth/schema";
import { prisma } from "./prisma";
import z from "zod";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const tokenSecretKey = String(process.env.JWT_SECRET);
const ACCESS_TOKEN_EXP = 60 * 60; // 60 minutes
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
  jti: string;
}

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  return await argon2.verify(hash, password);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const rawPayload = await verify(token, tokenSecretKey, "HS256");
  return JWTPayloadSchema.parse(rawPayload);
}

export async function signAccessToken(payload: { userId: string; email?: string }) {
  return await sign(
    {
      sub: payload.userId,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
    },
    tokenSecretKey,
    "HS256",
  );
}

export async function signRefreshToken(payload: { userId: string; email?: string }) {
  return await sign(
    {
      sub: payload.userId,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
    },
    tokenSecretKey,
    "HS256",
  );
}

export const AuthMiddlewareEnvSchema = z.object({
  Variables: z.object({
    user: UserMeResponseSchema,
  }),
});
export type AuthMiddlewareEnv = z.infer<typeof AuthMiddlewareEnvSchema>;

const factory = createFactory<AuthMiddlewareEnv>();

export const checkAuthorized = factory.createMiddleware(async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Authorization header not provided or invalid" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    let decodedToken;
    try {
      decodedToken = await verifyToken(token);
    } catch {
      return c.json({ error: "Invalid or expired token." }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.sub },
    });

    if (!user) {
      return c.json({ error: "User not found." }, 401);
    }

    // c.set("userId", decodedToken.sub);
    // c.set("email", decodedToken.email);
    c.set("user", user);

    await next();
  } catch (err) {
    console.error("Authorization error:", err);
    return c.json({ error: "Failed to authorized." }, 500);
  }
});

export const auth = betterAuth({
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:5173"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/auth",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

import { z } from "@hono/zod-openapi";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
});
export const UserMeResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({ id: z.string(), email: z.email() }),
});

export const JWTPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().optional(),
  iat: z.number(),
  exp: z.number(),
  jti: z.string(),
});

export const RefreshTokenSchema = z.object({ refreshToken: z.string() });
export const LogoutResponseSchema = z.object({ message: z.string() });
export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });
export const RefreshRequestSchema = z.object({ refreshToken: z.string() });
export const RefreshTokenResponseSchema = z.object({ accessToken: z.string() });

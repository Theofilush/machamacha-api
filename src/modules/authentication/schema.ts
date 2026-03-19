import { z } from "@hono/zod-openapi";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.email(),
  }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

export const LogoutResponseSchema = z.object({ message: z.string() });
export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

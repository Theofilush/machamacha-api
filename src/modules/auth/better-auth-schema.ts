import { z } from "@hono/zod-openapi";

export const BetterLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const BetterRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export const BetterSocialLoginSchema = z.object({
  provider: z.enum(["google"]),
  callbackURL: z.string().optional(),
});

export const BetterSocialLoginResponseSchema = z.object({
  url: z.string(),
});

export const BetterUserResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    image: z.string().nullable().optional(),
  }),
  session: z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    userId: z.string(),
    expiresAt: z.string(),
    token: z.string(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  }),
});

export const BetterErrorSchema = z.object({ message: z.string() });
export const BetterLogoutResponseSchema = z.object({ success: z.boolean() });

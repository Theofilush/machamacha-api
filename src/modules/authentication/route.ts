import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { AuthResponseSchema, ErrorSchema, LoginSchema, RegisterSchema, UserResponseSchema } from "./schema";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { exampleRequestRegister, exampleResponseLogin, exampleResponseRegister } from "./payload-example";

const tags = ["authentication"];

export const authRoute = new OpenAPIHono();

export async function signJWT(payload: Record<string, unknown>) {
  return await sign(payload, process.env.JWT_SECRET!, "HS256");
}

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags,
    request: { body: { content: { "application/json": { schema: LoginSchema } } } },
    responses: {
      200: { description: "Login successful", content: { "application/json": { schema: AuthResponseSchema, example: exampleResponseLogin } } },
      401: { description: "Invalid credentials", content: { "application/json": { schema: ErrorSchema, example: { error: "Invalid credentials" } } } },
      500: { description: "Internal server error", content: { "application/json": { schema: ErrorSchema, example: { error: "Internal server error" } } } },
    },
  }),
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: { email },
        include: { password: true },
      });

      if (!user || !user.password) {
        return c.json({ error: "Invalid credentials" }, 401);
      }
      //   const testHash = await bcrypt.hash("secret123", 10);
      //   console.log("New hash:", testHash);

      const isValid = await bcrypt.compare(password, user.password.hash);
      if (!isValid) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      const token = await signJWT({ userId: user.id, email: user.email });
      return c.json(
        {
          token,
          user: { id: user.id, email: user.email },
        },
        200,
      );
    } catch (err) {
      console.error("Error login:", err);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/register",
    tags,
    request: { body: { content: { "application/json": { schema: RegisterSchema, example: exampleRequestRegister } } } },
    responses: {
      201: { description: "User registered successfully", content: { "application/json": { schema: UserResponseSchema, example: exampleResponseRegister } } },
      409: { description: "User already exists", content: { "application/json": { schema: ErrorSchema, example: { error: "User already exists" } } } },
      500: { description: "Internal server error", content: { "application/json": { schema: ErrorSchema, example: { error: "Internal server error" } } } },
    },
  }),
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({ error: "User already exists" }, 409);
      }
      const hash = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: {
            create: { hash },
          },
        },
      });

      return c.json({ id: newUser.id, email: newUser.email }, 201);
    } catch (err) {
      console.error("Error register:", err);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

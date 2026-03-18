import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { ErrorSchema, UsersSchema } from "./schema";

export const userRoute = new OpenAPIHono();

const tags = ["users"];

// GET /users
userRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
      200: { description: "Retrieve all users", content: { "application/json": { schema: UsersSchema } } },
      500: { description: "Internal server error", content: { "application/json": { schema: ErrorSchema, example: { error: "Internal server error" } } } },
    },
  }),
  async (c) => {
    try {
      const users = await prisma.user.findMany();

      return c.json(users, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to retrieve users" }, 500);
    }
  },
);

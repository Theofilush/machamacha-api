import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { CartListResponseSchema, ErrorSchema } from "./schema";
import { verify } from "hono/jwt";
import { exampleResponseCartList } from "./payload-example";

const tags = ["carts"];

export const cartRoute = new OpenAPIHono();

cartRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
      200: { description: "List of all carts", content: { "application/json": { schema: CartListResponseSchema, example: exampleResponseCartList } } },
      401: { description: "Unauthorized. Invalid authentication token.", content: { "application/json": { schema: ErrorSchema, example: { error: "Unauthorized. Invalid authentication token." } } } },
      500: { description: "Failed to get all carts", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to get all carts" } } } },
    },
  }),
  async (c) => {
    try {
      const token = c.req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return c.json({ error: "Unauthorized. Invalid authentication token." }, 401);
      }

      let payload;
      try {
        payload = await verify(token, process.env.JWT_SECRET!, "HS256");
      } catch {
        return c.json({ error: "Unauthorized. Invalid authentication token." }, 401);
      }

      const carts = await prisma.cart.findMany({
        include: {
          items: true,
        },
      });

      return c.json(carts, 200);
    } catch (err) {
      console.error("Error get carts:", err);
      return c.json({ error: "Failed to get all carts" }, 500);
    }
  },
);

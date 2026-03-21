import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { CartListResponseSchema, CartSchema, ErrorSchema } from "./schema";
import { verify } from "hono/jwt";
import { exampleResponseCartList } from "./payload-example";
import { checkAuthorized } from "../../lib/auth";

const tags = ["carts"];

export const cartRoute = new OpenAPIHono();

cartRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: checkAuthorized,
    tags,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: "List of all carts", content: { "application/json": { schema: CartSchema, example: exampleResponseCartList } } },
      401: { description: "Unauthorized. Invalid authentication token.", content: { "application/json": { schema: ErrorSchema, example: { error: "Unauthorized. Invalid authentication token." } } } },
      500: { description: "Failed to get all carts", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to get all carts" } } } },
    },
  }),
  async (c) => {
    try {
      const user = c.get("user");

      const cart = await prisma.cart.findFirst({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart) {
        const newCart = await prisma.cart.create({
          data: { userId: user.id },
          include: { items: { include: { product: true } } },
        });
        console.log(newCart);
        return c.json(newCart, 200);
      }

      console.log(cart);
      return c.json(cart, 200);
    } catch (err) {
      console.error("Error get carts:", err);
      return c.json({ error: "Failed to get all carts" }, 500);
    }
  },
);

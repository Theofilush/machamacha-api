import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { AddCartItemSchema, CartItemSchema, CartItemSchema2, CartsSchema, ErrorSchema } from "./schema";
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
      200: { description: "List of all carts", content: { "application/json": { schema: CartsSchema, example: exampleResponseCartList } } },
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
      return c.json(user, 200);
    } catch (err) {
      console.error("Error get carts:", err);
      return c.json({ error: "Failed to get all carts" }, 500);
    }
  },
);

// POST /cart/items
cartRoute.openapi(
  createRoute({
    method: "post",
    path: "/items",
    middleware: checkAuthorized,
    tags,
    security: [{ bearerAuth: [] }],
    request: {
      body: { content: { "application/json": { schema: AddCartItemSchema } } },
    },
    responses: {
      200: { description: "Item added to cart", content: { "application/json": { schema: CartItemSchema2, example: exampleResponseCartList } } },
      400: { description: "Bad request. Invalid request body.", content: { "application/json": { schema: ErrorSchema, example: { error: "Bad request. Invalid request body." } } } },
      401: { description: "Unauthorized. Invalid authentication token.", content: { "application/json": { schema: ErrorSchema, example: { error: "Unauthorized. Invalid authentication token." } } } },
      500: { description: "Failed to add item to cart", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to add item to cart" } } } },
    },
  }),
  async (c) => {
    try {
      const user = c.get("user");
      const body = await c.req.valid("json");

      const cart = await prisma.cart.findFirst({
        where: { userId: user.id },
      });

      if (!cart) {
        return c.json({ error: "Bad request. Invalid request body." }, 400);
      }

      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          quantity: body.quantity,
        },
        include: { product: true },
      });

      console.log(newCartItem);
      return c.json(user, 200);
    } catch (err) {
      console.error("Error get carts:", err);
      return c.json({ error: "Failed to add item to cart" }, 500);
    }
  },
);

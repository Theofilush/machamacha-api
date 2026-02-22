import { prisma } from "../../lib/prisma";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, ProductSchema, ProductSlugParamSchema, ProductsSchema } from "./schema";
import { exampleResponseGetBySlug } from "./data";

const tags = ["/products"];

export const productRoute = new OpenAPIHono();

// GET /products
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
      200: { description: "Retrieve all products", content: { "application/json": { schema: ProductsSchema } } },
      500: { description: "Internal server error", content: { "application/json": { schema: ErrorSchema, example: { error: "Internal server error" } } } },
    },
  }),
  async (c) => {
    try {
      const allProducts = await prisma.product.findMany();

      return c.json(allProducts, 200);
    } catch (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /products/:slug
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    tags,
    request: {
      params: ProductSlugParamSchema,
    },
    responses: {
      200: { description: "Retrieve a Product by slug", content: { "application/json": { schema: ProductSchema, example: exampleResponseGetBySlug } } },
      404: { description: "Product not found", content: { "application/json": { schema: ErrorSchema, example: { error: "Product not found" } } } },
      500: { description: "Internal server error", content: { "application/json": { schema: ErrorSchema, example: { error: "Internal server error" } } } },
    },
  }),
  async (c) => {
    try {
      const { slug } = c.req.valid("param");

      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }

      return c.json(product, 200);
    } catch (err) {
      console.error("Error get product by slug:", err);
      return c.json({ error: "Failed to get product by slug" }, 500);
    }
  },
);

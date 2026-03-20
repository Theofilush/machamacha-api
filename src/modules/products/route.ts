import { prisma } from "../../lib/prisma";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, ProductCreateSchema, ProductIdParamSchema, ProductSchema, ProductSlugParamSchema, ProductsSchema, ProductUpdateSchema, SuccessSchema } from "./schema";
import { exampleRequestCreateProduct, exampleRequestUpdateProduct, exampleResponseCreateProduct, exampleResponseGetBySlug, exampleResponseUpdateProduct } from "./payload-example";
import { generateSlug } from "../../lib/util";

const tags = ["products"];

export const productRoute = new OpenAPIHono();

// GET /products
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
      200: { description: "Retrieve all products", content: { "application/json": { schema: ProductsSchema } } },
      500: { description: "Failed to get all products", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to get all products" } } } },
    },
  }),
  async (c) => {
    try {
      const allProducts = await prisma.product.findMany();

      return c.json(allProducts, 200);
    } catch (err) {
      console.error(err);
      return c.json({ error: "Failed to get products" }, 500);
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
      500: { description: "Failed to get product by slug", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to get product by slug" } } } },
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

// DELETE /products/:id
productRoute.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags,
    request: {
      params: ProductIdParamSchema,
    },
    responses: {
      200: { description: "Product deleted successfully", content: { "application/json": { schema: SuccessSchema, example: { message: "Product deleted successfully" } } } },
      404: { description: "Product not found", content: { "application/json": { schema: ErrorSchema, example: { error: "Product not found" } } } },
      500: { description: "Failed to delete product", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to delete product" } } } },
    },
  }),
  async (c) => {
    try {
      const { id } = c.req.valid("param");

      await prisma.product.delete({ where: { id } });

      return c.json({ message: "Product deleted successfully" }, 200);
    } catch (err: any) {
      if (err.code === "P2025") {
        return c.json({ error: "Product not found" }, 404);
      }
      return c.json({ error: "Failed to delete product" }, 500);
    }
  },
);

// POST /products
productRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags,
    request: {
      body: { content: { "application/json": { schema: ProductCreateSchema, example: exampleRequestCreateProduct } } },
    },
    responses: {
      201: { description: "Product created successfully", content: { "application/json": { schema: ProductSchema, example: exampleResponseCreateProduct } } },
      409: { description: "Product already exists", content: { "application/json": { schema: ErrorSchema, example: { error: "Product already exists" } } } },
      500: { description: "Failed to create product", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to create product" } } } },
    },
  }),
  async (c) => {
    try {
      const body = c.req.valid("json");

      body.slug = generateSlug(body);

      const newProduct = await prisma.product.create({
        data: {
          name: body.name,
          slug: body.slug,
          price: body.price,
          imageUrl: body.imageUrl,
          description: body.description,
          category: body.category,
          stock: body.stock,
          tags: body.tags,
        },
      });

      return c.json(newProduct, 201);
    } catch (err: any) {
      if (err.code === "P2002") {
        return c.json({ error: "Product already exists" }, 409);
      }
      return c.json({ error: "Failed to create product" }, 500);
    }
  },
);

// PUT /products/:id
productRoute.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    tags,
    request: {
      params: ProductIdParamSchema,
      body: {
        content: { "application/json": { schema: ProductUpdateSchema, example: exampleRequestUpdateProduct } },
      },
    },
    responses: {
      200: { description: "Product updated successfully", content: { "application/json": { schema: ProductSchema, example: exampleResponseUpdateProduct } } },
      404: { description: "Product not found", content: { "application/json": { schema: ErrorSchema, example: { error: "Product not found" } } } },
      409: { description: "Product already exists", content: { "application/json": { schema: ErrorSchema, example: { error: "Product already exists" } } } },
      500: { description: "Failed to update product", content: { "application/json": { schema: ErrorSchema, example: { error: "Failed to update product" } } } },
    },
  }),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name: body.name,
          slug: body.slug,
          price: body.price,
          imageUrl: body.imageUrl,
          description: body.description,
          category: body.category,
          stock: body.stock,
          tags: body.tags,
        },
      });

      if (!updatedProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      return c.json(updatedProduct, 200);
    } catch (err: any) {
      if (err.code === "P2025") {
        return c.json({ error: "Product not found" }, 404);
      }
      if (err.code === "P2002") {
        return c.json({ error: "Product already exists" }, 409);
      }
      return c.json({ error: "Failed to update product" }, 500);
    }
  },
);

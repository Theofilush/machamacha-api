import { z } from "@hono/zod-openapi";

export const ProductSchema = z.object({
  id: z.string().openapi({ example: "01ARZ3NDEKTSV4RRFFQ69G5FAV", description: "Unique product ID" }),
  name: z.string().min(1).openapi({ example: "Premium Matcha Latte" }),
  slug: z.string().openapi({ example: "premium-matcha-latte" }),
  price: z.number().nonnegative().openapi({ example: 75000, description: "Price in IDR" }),
  imageUrl: z.url().openapi({ example: "https://cdn.machamacha.com/products/matcha-latte.jpg" }),
  description: z.string().min(10).openapi({ example: "A smooth and vibrant Japanese matcha latte blend." }),
  category: z.string().openapi({ example: "matcha" }),
  stock: z.number().int().nonnegative().openapi({ example: 120 }),
  tags: z
    .array(z.string())
    .default([])
    .openapi({ example: ["matcha", "latte", "premium"] }),
  createdAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
  updatedAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
});

export const SeedProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ProductSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({
      param: { name: "slug", in: "path" },
      description: "Unique slug identifier of the product",
      example: "premium-matcha-latte",
    }),
});

export const ProductIdParamSchema = z.object({
  id: z
    .string()
    .min(26)
    .max(26)
    .openapi({
      param: { name: "id", in: "path" },
      description: "Unique ULID of the character",
      example: "clabcdef1234567890ghijklmn",
    }),
});

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  price: z.number().int().nonnegative(),
  imageUrl: z.url(),
  description: z.string().min(10),
  category: z.string(),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()).default([]),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  price: z.number().min(0),
  imageUrl: z.url().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

export const SeedProductsSchema = SeedProductSchema.array();
export const ProductsSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
export type Products = z.infer<typeof ProductsSchema>;
export type SeedProduct = z.infer<typeof SeedProductSchema>;
export type SeedProducts = z.infer<typeof SeedProductsSchema>;

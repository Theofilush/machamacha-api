import { z } from "@hono/zod-openapi";

export const ProductSchema = z.object({
  id: z.string().openapi({ example: "prod-001", description: "Unique product ID" }),
  name: z.string().min(1).openapi({ example: "Premium Matcha Latte" }),
  slug: z.string().openapi({ example: "premium-matcha-latte" }),
  price: z.number().nonnegative().openapi({ example: 75000, description: "Price in IDR" }),
  imageUrl: z.string().url().openapi({ example: "https://cdn.machamacha.com/products/matcha-latte.jpg" }),
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

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

export const ProductsSchema = z.array(ProductSchema);

export type product = z.infer<typeof ProductSchema>;
export type Products = z.infer<typeof ProductsSchema>;

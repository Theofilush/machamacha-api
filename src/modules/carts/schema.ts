import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

import { CartModelSchema } from "../../generated/zod/schemas";

// export const CartItemSchema = z.object({
//   id: z.string().openapi({ example: "01ARZ3NDEKTSV4RRFFQ69G5FAV", description: "Unique cart item ID" }),
//   productId: z.string().openapi({ example: "01ARZ3NDEKTSV4RRFFQ69G5FAV", description: "Unique product ID" }),
//   quantity: z.number().int().nonnegative().openapi({ example: 2 }),
//   createdAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
//   updatedAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
// });

// export const CartSchema = z.object({
//   id: z.string().openapi({ example: "01ARZ3NDEKTSV4RRFFQ69G5FAV", description: "Unique cart ID" }),
//   userId: z.string().openapi({ example: "01ARZ3NDEKTSV4RRFFQ69G5FAV", description: "Unique user ID" }),
//   createdAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
//   updatedAt: z.date().openapi({ example: "2026-02-14T18:00:00Z" }),
//   items: z.array(CartItemSchema).default([]),
// });

// export type Cart = z.infer<typeof CartSchema>;
// export type Carts = z.infer<typeof CartsSchema>;

export const CartsSchema = z.array(CartModelSchema);

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  cartId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(CartItemSchema),
});

export const CartListResponseSchema = z.array(CartSchema);

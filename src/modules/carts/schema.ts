import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

import { CartItemModelSchema, CartModelSchema, ProductModelSchema } from "../../generated/zod/schemas";

export const CartsSchema = z.array(CartModelSchema);

export const CartItemSchema = CartItemModelSchema.strip().extend({
  product: ProductModelSchema.strip().omit({
    createdAt: true,
    updatedAt: true,
  }),
});
// .omit({
//   cartId: true,
//   createdAt: true,
//   updatedAt: true,
// })
// .openapi("CartItem");

export const CartSchema = CartModelSchema.extend({
  items: z.array(CartItemSchema),
});

export const AddCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().default(1),
});

export const CartItemSchema2 = z.object({
  id: z.string(),

  quantity: z.number(),

  productId: z.string(),
  product: ProductModelSchema,

  cartId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

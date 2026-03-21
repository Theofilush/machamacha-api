import { z } from "@hono/zod-openapi";
import { CartItemModelSchema, CartModelSchema, ProductModelSchema } from "../../generated/zod/schemas";

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

export const ProductSchema = ProductModelSchema.strip().omit({
  cartItems: true,
  createdAt: true,
  updatedAt: true,
});

export const CartItemSchema = CartItemModelSchema.strip()
  .omit({
    createdAt: true,
    updatedAt: true,
    cart: true,
  })
  .extend({
    product: ProductSchema,
  });

export const CartSchema = CartModelSchema.strip()
  .omit({
    createdAt: true,
    updatedAt: true,
    user: true,
  })
  .extend({
    items: z.array(CartItemSchema),
  });

export const AddCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().default(1),
});

import { z } from "@hono/zod-openapi";
import { CartItemModelSchema, CartModelSchema, ProductModelSchema } from "../../generated/zod/schemas";

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

const FullProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  description: z.string(),
  category: z.string(),
  stock: z.number(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductSchema = ProductModelSchema.strip().omit({
  cartItems: true,
  createdAt: true,
  updatedAt: true,
});

const FullCartItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  productId: z.string(),
  cartId: z.string(),
  product: ProductModelSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartItemSchema = CartItemModelSchema.strip()
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    product: ProductSchema,
  });

const FullCartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(CartItemModelSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartSchema = CartModelSchema.strip()
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    items: z.array(CartItemSchema),
  });

export const CartResponseSchema = CartSchema;
export const CartsSchema = z.array(CartSchema);

export const AddCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().default(1),
});

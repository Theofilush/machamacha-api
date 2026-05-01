import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { checkAuthorized } from "../../lib/auth";
import { midtransSnap, midtransCore } from "../../lib/midtrans";
import { CheckoutRequestSchema, CheckoutResponseSchema, ErrorSchema, MidtransNotificationSchema } from "./schema";
import crypto from "crypto";

const tags = ["checkout"];

export const checkoutRoute = new OpenAPIHono();

checkoutRoute.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// POST /checkout/
checkoutRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    middleware: checkAuthorized,
    tags,
    security: [{ bearerAuth: [] }],
    request: { body: { content: { "application/json": { schema: CheckoutRequestSchema } } } },
    responses: {
      200: { description: "Checkout successful", content: { "application/json": { schema: CheckoutResponseSchema } } },
      400: { description: "Empty cart or invalid request", content: { "application/json": { schema: ErrorSchema } } },
      401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
      500: { description: "Failed to process checkout", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    try {
      const user = c.get("user");

      // 1. Get user cart items
      const cart = await prisma.cart.findFirst({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        return c.json({ error: "Cart is empty" }, 400);
      }

      // 2. Calculate total price and prepare order items
      let totalAmount = 0;
      const orderItemsData = cart.items.map((item) => {
        const amount = item.product.price * item.quantity;
        totalAmount += amount;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        };
      });

      // 3. Create Order in DB
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: user.id,
            totalPrice: totalAmount,
            status: "PENDING",
            items: {
              create: orderItemsData,
            },
          },
        });

        // Optional: Clear cart items
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      });

      // 4. Create Midtrans Transaction
      const parameter = {
        transaction_details: {
          order_id: order.id,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: user.name || user.email,
          email: user.email,
        },
        item_details: cart.items.map((item) => ({
          id: item.productId,
          price: item.product.price,
          quantity: item.quantity,
          name: item.product.name,
        })),
      };

      const transaction = await midtransSnap.createTransaction(parameter);

      return c.json(
        {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
          orderId: order.id,
        },
        200,
      );
    } catch (err) {
      console.error("Error checkout:", err);
      return c.json({ error: "Failed to process checkout" }, 500);
    }
  },
);

// POST /checkout/webhook
checkoutRoute.openapi(
  createRoute({
    method: "post",
    path: "/webhook",
    tags,
    request: {
      body: {
        content: {
          "application/json": {
            schema: MidtransNotificationSchema,
            example: {
              transaction_status: "settlement",
              status_code: "200",
              order_id: "ORDER-12345",
              gross_amount: "50000.00",
              signature_key: "dummy_signature_key",
              payment_type: "qris",
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Webhook processed" },
      400: { description: "Invalid signature" },
      500: { description: "Internal server error" },
    },
  }),
  async (c) => {
    try {
      const body = await c.req.json();

      // Verify signature
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
      const hashed = crypto
        .createHash("sha512")
        .update(body.order_id + body.status_code + body.gross_amount + serverKey)
        .digest("hex");

      //   if (hashed !== body.signature_key) {
      //     return c.json({ error: "Invalid signature" }, 400);
      //   }
      if (process.env.MIDTRANS_IS_PRODUCTION === "true" && hashed !== body.signature_key) {
        return c.json({ error: "Invalid signature" }, 400);
      }

      const transactionStatus = body.transaction_status;
      const orderId = body.order_id;

      let newStatus = "PENDING";

      if (transactionStatus === "capture" || transactionStatus === "settlement") {
        newStatus = "PAID";
      } else if (transactionStatus === "deny" || transactionStatus === "expire" || transactionStatus === "cancel") {
        newStatus = "FAILED";
      } else if (transactionStatus === "pending") {
        newStatus = "PENDING";
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      return c.json({ message: "Webhook processed" }, 200);
    } catch (err) {
      console.error("Webhook error:", err);
      return c.json({ error: "Webhook error" }, 500);
    }
  },
);

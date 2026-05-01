import { z } from "@hono/zod-openapi";

export const CheckoutRequestSchema = z.object({
  // No body needed for now if we just checkout from the current cart
  // But maybe we want to allow passing some info?
});

export const CheckoutResponseSchema = z.object({
  token: z.string().describe("Midtrans Snap Token"),
  redirect_url: z.string().describe("Midtrans Snap Redirect URL"),
  orderId: z.string(),
});

export const MidtransNotificationSchema = z.object({
  transaction_status: z.string(),
  order_id: z.string(),
  payment_type: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
});

export const ErrorSchema = z.object({
  error: z.string(),
});

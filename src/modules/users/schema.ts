import { z } from "zod";

import { UserModelSchema } from "../../generated/zod/schemas";

export const UserSchema = UserModelSchema.omit({
  password: true,
  carts: true,
  createdAt: true,
  updatedAt: true,
});

export const UsersSchema = z.array(UserSchema);

export const ErrorSchema = z.object({ error: z.string() });
export const SuccessSchema = z.object({ message: z.string() });

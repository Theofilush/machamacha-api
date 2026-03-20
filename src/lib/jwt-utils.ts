import { sign } from "hono/jwt";

export async function signJWT(payload: object) {
  return await sign(
    {
      ...payload,
      issuedAt: Math.floor(Date.now() / 1000),
      jwtUniqueId: crypto.randomUUID(),
    },
    process.env.JWT_SECRET!,
    "HS256",
  );
}

import { redis } from "../config/redis.js"

export default async function storeRefreshToken(userId, refreshToken) {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
}

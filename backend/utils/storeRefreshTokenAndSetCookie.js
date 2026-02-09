import { redis } from "../config/redis.js";

export async function storeRefreshToken(refreshToken, userId) {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60 * 1000,
  );
}

export function setCookie(accessToken, refreshToken, res) {
  res.cookie("accessToken", accessToken, {
    httponly: true,
    secure: (process.env.NODE_ENV = "production"),
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httponly: true,
    secure: (process.env.NODE_ENV = "production"),
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

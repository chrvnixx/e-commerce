import { redis } from "../config/redis.js";

export const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60 * 1000,
  );
};

export const setCookies = (accessToken, refreshToken, res) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: (process.env.NODE_ENV = "production"),
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: (process.env.NODE_ENV = "production"),
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

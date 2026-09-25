import "server-only";
import { withRedis } from "../redis";
import axios from "axios";

export async function getGoogleAccessToken(googleUserId: string) {
  const cachedAccessToken = await withRedis((redis) =>
    redis.get(`access:${googleUserId}`),
  );

  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const refreshToken = await withRedis((redis) =>
    redis.get(`user:${googleUserId}`),
  );

  if (!refreshToken) {
    throw new Error("Google refresh token not found");
  }

  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (!data.access_token) {
    throw new Error("Google access token not returned");
  }

  const expiresIn = data.expires_in ?? 3600;

  await withRedis((redis) =>
    redis.set(`access:${googleUserId}`, data.access_token, {
      expiration: {
        type: "EX",
        value: Math.max(expiresIn - 60, 60),
      },
    }),
  );

  return data.access_token;
}

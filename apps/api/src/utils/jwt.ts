import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env["JWT_SECRET"] ?? "fallback-secret";
const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] ?? "fallback-refresh-secret";

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): { sub: string } {
  return jwt.verify(token, ACCESS_SECRET) as { sub: string };
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

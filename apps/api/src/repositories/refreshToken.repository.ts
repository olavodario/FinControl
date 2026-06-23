// In-memory store for invalidated refresh tokens.
// Replace with a DB/Redis table in production.
const invalidatedTokens = new Set<string>();

export function invalidateRefreshToken(token: string): void {
  invalidatedTokens.add(token);
}

export function isRefreshTokenInvalidated(token: string): boolean {
  return invalidatedTokens.has(token);
}

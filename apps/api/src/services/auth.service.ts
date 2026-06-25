import bcrypt from "bcryptjs";
import type { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "@fincontrol/types";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import {
  invalidateRefreshToken,
  isRefreshTokenInvalidated,
} from "../repositories/refreshToken.repository.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { createDefaultCategoriesForUser } from "./category.service.js";

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
  const existing = await findUserByEmail(dto.email);
  if (existing) {
    throw new AuthError("EMAIL_TAKEN", "E-mail já está em uso.");
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const user = await createUser({ name: dto.name, email: dto.email, passwordHash });

  await createDefaultCategoriesForUser(user.id);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function login(dto: LoginRequestDto): Promise<AuthResponseDto> {
  const user = await findUserByEmail(dto.email);
  if (!user) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciais inválidas.");
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciais inválidas.");
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function refresh(token: string): Promise<{ accessToken: string }> {
  if (isRefreshTokenInvalidated(token)) {
    throw new AuthError("TOKEN_INVALID", "Token inválido.");
  }

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AuthError("TOKEN_INVALID", "Token inválido ou expirado.");
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AuthError("TOKEN_INVALID", "Token inválido.");
  }

  return { accessToken: signAccessToken(user.id) };
}

export function logout(token: string): void {
  invalidateRefreshToken(token);
}

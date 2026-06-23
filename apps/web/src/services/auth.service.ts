import type { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "@fincontrol/types";
import type { ApiResponse } from "@fincontrol/types";
import { api } from "./api.js";

export async function register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
  const res = await api.post<ApiResponse<AuthResponseDto>>("/auth/register", dto);
  return res.data.data;
}

export async function login(dto: LoginRequestDto): Promise<AuthResponseDto> {
  const res = await api.post<ApiResponse<AuthResponseDto>>("/auth/login", dto);
  return res.data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}

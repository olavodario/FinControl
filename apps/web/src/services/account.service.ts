import type {
  AccountResponseDto,
  ApiResponse,
  CreateAccountRequestDto,
  UpdateAccountRequestDto,
} from "@fincontrol/types";
import { api } from "./api.js";

export async function getAccounts(): Promise<AccountResponseDto[]> {
  const { data } = await api.get<ApiResponse<AccountResponseDto[]>>("/accounts");
  return data.data;
}

export async function getAccount(id: string): Promise<AccountResponseDto> {
  const { data } = await api.get<ApiResponse<AccountResponseDto>>(`/accounts/${id}`);
  return data.data;
}

export async function createAccount(dto: CreateAccountRequestDto): Promise<AccountResponseDto> {
  const { data } = await api.post<ApiResponse<AccountResponseDto>>("/accounts", dto);
  return data.data;
}

export async function updateAccount(
  id: string,
  dto: UpdateAccountRequestDto,
): Promise<AccountResponseDto> {
  const { data } = await api.put<ApiResponse<AccountResponseDto>>(`/accounts/${id}`, dto);
  return data.data;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`);
}

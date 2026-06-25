import type {
  ApiResponse,
  CreateTransactionRequestDto,
  PaginatedResponseDto,
  TransactionFiltersDto,
  TransactionResponseDto,
  UpdateTransactionRequestDto,
} from "@fincontrol/types";
import { api } from "./api.js";

export async function getTransactions(
  filters?: TransactionFiltersDto,
): Promise<PaginatedResponseDto<TransactionResponseDto>> {
  const { data } = await api.get<ApiResponse<PaginatedResponseDto<TransactionResponseDto>>>(
    "/transactions",
    { params: filters },
  );
  return data.data;
}

export async function createTransaction(
  dto: CreateTransactionRequestDto,
): Promise<TransactionResponseDto> {
  const { data } = await api.post<ApiResponse<TransactionResponseDto>>("/transactions", dto);
  return data.data;
}

export async function updateTransaction(
  id: string,
  dto: UpdateTransactionRequestDto,
): Promise<TransactionResponseDto> {
  const { data } = await api.put<ApiResponse<TransactionResponseDto>>(`/transactions/${id}`, dto);
  return data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

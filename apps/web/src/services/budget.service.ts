import type { ApiResponse, BudgetResponseDto, CreateBudgetRequestDto } from "@fincontrol/types";
import { api } from "./api.js";

export async function getBudgets(month: number, year: number): Promise<BudgetResponseDto[]> {
  const { data } = await api.get<ApiResponse<BudgetResponseDto[]>>("/budgets", {
    params: { month, year },
  });
  return data.data;
}

export async function upsertBudget(dto: CreateBudgetRequestDto): Promise<BudgetResponseDto> {
  const { data } = await api.post<ApiResponse<BudgetResponseDto>>("/budgets", dto);
  return data.data;
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}

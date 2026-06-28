import type {
  ApiResponse,
  CreateGoalRequestDto,
  DepositGoalRequestDto,
  GoalResponseDto,
  GoalStatus,
  UpdateGoalRequestDto,
} from "@fincontrol/types";
import { api } from "./api.js";

export async function getGoals(status?: GoalStatus): Promise<GoalResponseDto[]> {
  const { data } = await api.get<ApiResponse<GoalResponseDto[]>>("/goals", {
    params: status ? { status } : undefined,
  });
  return data.data;
}

export async function getGoal(id: string): Promise<GoalResponseDto> {
  const { data } = await api.get<ApiResponse<GoalResponseDto>>(`/goals/${id}`);
  return data.data;
}

export async function createGoal(dto: CreateGoalRequestDto): Promise<GoalResponseDto> {
  const { data } = await api.post<ApiResponse<GoalResponseDto>>("/goals", dto);
  return data.data;
}

export async function updateGoal(id: string, dto: UpdateGoalRequestDto): Promise<GoalResponseDto> {
  const { data } = await api.put<ApiResponse<GoalResponseDto>>(`/goals/${id}`, dto);
  return data.data;
}

export async function depositToGoal(
  id: string,
  dto: DepositGoalRequestDto,
): Promise<GoalResponseDto> {
  const { data } = await api.patch<ApiResponse<GoalResponseDto>>(`/goals/${id}/deposit`, dto);
  return data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}

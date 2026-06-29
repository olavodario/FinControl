import type {
  CreateGoalRequestDto,
  DepositGoalRequestDto,
  GoalResponseDto,
  GoalStatus,
  UpdateGoalRequestDto,
} from "../types/index.js";
import { AppError } from "../utils/appError.js";
import {
  createGoal,
  deleteGoalById,
  findGoalById,
  findGoalsByUser,
  updateGoal,
} from "../repositories/goal.repository.js";
import type { GoalRecord } from "../repositories/goal.repository.js";

function toDto(goal: GoalRecord): GoalResponseDto {
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const percentage = target > 0 ? Number(((current / target) * 100).toFixed(1)) : 0;
  const remaining = Math.max(target - current, 0);

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: target,
    currentAmount: current,
    deadline: goal.deadline?.toISOString(),
    color: goal.color,
    icon: goal.icon,
    status: goal.status as GoalStatus,
    percentage,
    remaining,
    createdAt: goal.createdAt.toISOString(),
  };
}

export async function listGoals(userId: string, status?: GoalStatus): Promise<GoalResponseDto[]> {
  const goals = await findGoalsByUser(userId, status ?? undefined);
  return goals.map(toDto);
}

export async function getGoal(id: string, userId: string): Promise<GoalResponseDto> {
  const goal = await findGoalById(id);
  if (!goal || goal.userId !== userId) {
    throw new AppError("NOT_FOUND", "Meta não encontrada.", 404);
  }
  return toDto(goal);
}

export async function createGoalForUser(
  userId: string,
  dto: CreateGoalRequestDto,
): Promise<GoalResponseDto> {
  const goal = await createGoal({
    userId,
    name: dto.name,
    targetAmount: dto.targetAmount,
    deadline: dto.deadline ? new Date(dto.deadline) : null,
    color: dto.color ?? "#3B82F6",
    icon: dto.icon ?? "target",
  });
  return toDto(goal);
}

export async function updateGoalForUser(
  id: string,
  userId: string,
  dto: UpdateGoalRequestDto,
): Promise<GoalResponseDto> {
  const existing = await findGoalById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Meta não encontrada.", 404);
  }

  const goal = await updateGoal(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.targetAmount !== undefined && { targetAmount: dto.targetAmount }),
    ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
    ...(dto.color !== undefined && { color: dto.color }),
    ...(dto.icon !== undefined && { icon: dto.icon }),
    ...(dto.status !== undefined && { status: dto.status }),
  });
  return toDto(goal);
}

export async function depositToGoal(
  id: string,
  userId: string,
  dto: DepositGoalRequestDto,
): Promise<GoalResponseDto> {
  const existing = await findGoalById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Meta não encontrada.", 404);
  }
  if (existing.status !== "ACTIVE") {
    throw new AppError(
      "GOAL_NOT_ACTIVE",
      "Não é possível depositar em uma meta concluída ou cancelada.",
      400,
    );
  }

  const newAmount = Number(existing.currentAmount) + dto.amount;
  const target = Number(existing.targetAmount);
  const newStatus = newAmount >= target ? "COMPLETED" : "ACTIVE";

  const goal = await updateGoal(id, {
    currentAmount: newAmount,
    status: newStatus,
  });
  return toDto(goal);
}

export async function deleteGoalForUser(id: string, userId: string): Promise<void> {
  const existing = await findGoalById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Meta não encontrada.", 404);
  }
  await deleteGoalById(id);
}

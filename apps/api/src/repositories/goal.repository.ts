import type { GoalStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

export type GoalRecord = Prisma.GoalGetPayload<Record<string, never>>;

export async function findGoalsByUser(userId: string, status?: GoalStatus): Promise<GoalRecord[]> {
  return prisma.goal.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findGoalById(id: string): Promise<GoalRecord | null> {
  return prisma.goal.findUnique({ where: { id } });
}

export async function createGoal(data: Prisma.GoalUncheckedCreateInput): Promise<GoalRecord> {
  return prisma.goal.create({ data });
}

export async function updateGoal(
  id: string,
  data: Prisma.GoalUncheckedUpdateInput,
): Promise<GoalRecord> {
  return prisma.goal.update({ where: { id }, data });
}

export async function deleteGoalById(id: string): Promise<GoalRecord> {
  return prisma.goal.delete({ where: { id } });
}

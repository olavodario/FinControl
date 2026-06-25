import type { ApiResponse, DashboardChartsDto, TransactionSummaryDto } from "@fincontrol/types";
import { api } from "./api.js";

export async function getDashboardCharts(month: number, year: number): Promise<DashboardChartsDto> {
  const { data } = await api.get<ApiResponse<DashboardChartsDto>>("/dashboard/charts", {
    params: { month, year },
  });
  return data.data;
}

export async function getTransactionSummary(
  month: number,
  year: number,
  type: "INCOME" | "EXPENSE",
): Promise<TransactionSummaryDto> {
  const { data } = await api.get<ApiResponse<TransactionSummaryDto>>("/transactions/summary", {
    params: { month, year, type },
  });
  return data.data;
}

import type { ApiResponse, DashboardDto } from "@fincontrol/types";
import { api } from "./api.js";

export async function getDashboard(month?: number, year?: number): Promise<DashboardDto> {
  const { data } = await api.get<ApiResponse<DashboardDto>>("/dashboard", {
    params: { month, year },
  });
  return data.data;
}

import type { ApiResponse, DashboardDto } from "@fincontrol/types";
import { api } from "./api.js";

export async function getDashboard(): Promise<DashboardDto> {
  const { data } = await api.get<ApiResponse<DashboardDto>>("/dashboard");
  return data.data;
}

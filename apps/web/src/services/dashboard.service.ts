import type { ApiResponse, DashboardDto, ProjectionDto } from "@fincontrol/types";
import { api } from "./api.js";

export async function getDashboard(month?: number, year?: number): Promise<DashboardDto> {
  const { data } = await api.get<ApiResponse<DashboardDto>>("/dashboard", {
    params: { month, year },
  });
  return data.data;
}

export async function getProjection(months?: number): Promise<ProjectionDto> {
  const { data } = await api.get<ApiResponse<ProjectionDto>>("/dashboard/projection", {
    params: { months },
  });
  return data.data;
}

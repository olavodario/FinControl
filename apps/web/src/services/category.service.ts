import type {
  ApiResponse,
  CategoryResponseDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from "@fincontrol/types";
import { api } from "./api.js";

export async function getCategories(): Promise<CategoryResponseDto[]> {
  const { data } = await api.get<ApiResponse<CategoryResponseDto[]>>("/categories");
  return data.data;
}

export async function createCategory(dto: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
  const { data } = await api.post<ApiResponse<CategoryResponseDto>>("/categories", dto);
  return data.data;
}

export async function updateCategory(
  id: string,
  dto: UpdateCategoryRequestDto,
): Promise<CategoryResponseDto> {
  const { data } = await api.put<ApiResponse<CategoryResponseDto>>(`/categories/${id}`, dto);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

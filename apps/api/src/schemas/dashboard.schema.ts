import { z } from "zod";

const monthYearSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const dashboardQuerySchema = monthYearSchema;
export const dashboardChartsQuerySchema = monthYearSchema;

import { z } from 'zod';

export const dashboardStatsQuerySchema = z.object({
  range: z.enum(['7d', '30d', '6m']).default('30d'),
});

export type DashboardRange = z.infer<typeof dashboardStatsQuerySchema>['range'];

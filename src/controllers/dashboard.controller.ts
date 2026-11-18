import type { Request, Response } from 'express';
import { getDashboardStats } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { dashboardStatsQuerySchema } from '../validators/dashboard.validator';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { range } = dashboardStatsQuerySchema.parse(req.query);
  const stats = await getDashboardStats(range);

  res.status(200).json({
    data: stats,
  });
});

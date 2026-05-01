import { Request, Response } from 'express';
import * as analyticsService from './analyticsService.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await analyticsService.getPlatformStats();
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

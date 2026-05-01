import { Router } from 'express';
import * as analyticsController from './analyticsController.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

router.use(protect, restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Platform analytics and stats (Admin only)
 */

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 */
router.get('/stats', analyticsController.getStats);

export default router;

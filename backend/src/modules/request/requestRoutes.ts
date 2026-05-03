import { Router } from 'express';
import * as requestController from './requestController.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Custom service requests
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new service request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               budget: { type: number }
 *     responses:
 *       201:
 *         description: Request created successfully
 */
router.post('/', requestController.create);

/**
 * @swagger
 * /requests/my:
 *   get:
 *     summary: Get current user's requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', requestController.getMy);

/**
 * @swagger
 * /requests/open:
 *   get:
 *     summary: Get all open requests (Providers only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/open', restrictTo(UserRole.PROVIDER), requestController.getOpen);

/**
 * @swagger
 * /requests/{id}/accept:
 *   patch:
 *     summary: Accept a request (Providers only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: number }
 */
router.patch('/:id/accept', restrictTo(UserRole.PROVIDER), requestController.accept);

/**
 * @swagger
 * /requests/all:
 *   get:
 *     summary: Get all requests (Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/all', restrictTo(UserRole.ADMIN), requestController.getAll);

/**
 * @swagger
 * /requests/{id}/status:
 *   patch:
 *     summary: Update request status (Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', restrictTo(UserRole.ADMIN), requestController.updateStatus);

/**
 * @swagger
 * /requests/{id}/bids:
 *   post:
 *     summary: Place a bid on a request (Providers only)
 *     tags: [Requests]
 */
router.post('/:id/bids', restrictTo(UserRole.PROVIDER), requestController.placeBid);

/**
 * @swagger
 * /requests/{id}/bids/{bidId}/accept:
 *   post:
 *     summary: Accept a bid on a request (Customer only)
 *     tags: [Requests]
 */
router.post('/:id/bids/:bidId/accept', requestController.acceptBid);

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a request (Customer only)
 *     tags: [Requests]
 */
router.delete('/:id', requestController.remove);

export default router;



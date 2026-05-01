import { Router } from 'express';
import * as feedbackController from './feedbackController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { createFeedbackSchema, updateFeedbackSchema } from '../../validation/feedbackValidation.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - serviceId
 *         - rating
 *         - comment
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         serviceId:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *       example:
 *         serviceId: 60d5ecb71f2a1b2d4c8b4567
 *         rating: 5
 *         comment: Excellent service! Highly recommended.
 */

/**
 * @swagger
 * /feedback/service/{serviceId}:
 *   get:
 *     summary: Get all feedback for a specific service
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of feedback for the service
 */
router.get('/service/:serviceId', feedbackController.getByService);
router.get('/provider/:providerId', feedbackController.getByProvider);


router.use(protect);

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Add feedback for a service
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       201:
 *         description: Feedback added successfully
 */
router.post('/', validate(createFeedbackSchema), feedbackController.create);
router.patch('/:id', validate(updateFeedbackSchema), feedbackController.update);
router.delete('/:id', feedbackController.remove);


export default router;

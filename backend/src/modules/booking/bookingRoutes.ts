import { Router } from 'express';
import * as bookingController from './bookingController.js';
import { UserRole } from '../../core/enums.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { createBookingSchema, updateBookingSchema } from '../../validation/bookingValidation.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - serviceId
 *         - bookingDate
 *         - totalPrice
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         serviceId:
 *           type: string
 *         providerId:
 *           type: string
 *         bookingDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         totalPrice:
 *           type: number
 *         notes:
 *           type: string
 */

router.use(protect);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/', validate(createBookingSchema), bookingController.create);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get current user's bookings (as user or provider)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', restrictTo(UserRole.ADMIN), bookingController.getAll);
router.get('/my', bookingController.getMy);
router.get('/:id', bookingController.getById);

/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     summary: Update booking (status/notes)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.patch('/:id', validate(updateBookingSchema), bookingController.update);
router.delete('/:id', bookingController.remove);
router.post('/:id/messages', bookingController.sendMessage);


export default router;

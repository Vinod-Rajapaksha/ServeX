import { Router } from 'express';
import * as announcementController from './announcementController.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         createdBy:
 *           type: string
 *       example:
 *         title: New Service Category Added
 *         content: We have added 'Gardening' to our service list!
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Returns all announcements
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get('/', announcementController.getAll);
router.get('/role/:role', announcementController.getByRole);

router.use(protect, restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create an announcement (Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       201:
 *         description: Announcement created
 */
router.post('/', announcementController.create);
router.patch('/:id', announcementController.update);


/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Announcement deleted
 */
router.delete('/:id', announcementController.remove);

export default router;

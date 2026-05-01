import { Router } from 'express';
import * as serviceController from './serviceController.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - categoryId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the service
 *         providerId:
 *           type: string
 *           description: The id of the user who provides the service
 *         categoryId:
 *           type: string
 *           description: The id of the service category
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *         numReviews:
 *           type: number
 *       example:
 *         title: Professional House Cleaning
 *         description: Thorough cleaning for your home.
 *         price: 50
 *         categoryId: 60d5ecb71f2a1b2d4c8b4567
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Returns the list of all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category id
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by provider id
 *     responses:
 *       200:
 *         description: The list of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', serviceController.getAll);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a service by id
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service id
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', serviceController.getOne);

router.use(protect, restrictTo(UserRole.PROVIDER, UserRole.ADMIN));

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only Providers/Admins)
 */
router.post('/', serviceController.create);

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       403:
 *         description: Not authorized to update this service
 */
router.patch('/:id', serviceController.update);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 */
router.delete('/:id', serviceController.remove);

export default router;

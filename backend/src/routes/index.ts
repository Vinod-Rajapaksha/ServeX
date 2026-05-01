import { Router } from 'express';
import authRoutes from '../modules/auth/authRoutes.js';
import categoryRoutes from '../modules/service-category/categoryRoutes.js';
import serviceRoutes from '../modules/service/serviceRoutes.js';
import bookingRoutes from '../modules/booking/bookingRoutes.js';
import feedbackRoutes from '../modules/feedback/feedbackRoutes.js';
import requestRoutes from '../modules/request/requestRoutes.js';
import announcementRoutes from '../modules/announcement/announcementRoutes.js';
import userRoutes from '../modules/user/userRoutes.js';
import analyticsRoutes from '../modules/analytics/analyticsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/requests', requestRoutes);
router.use('/announcements', announcementRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

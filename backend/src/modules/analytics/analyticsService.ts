import User from '../../database/models/User.js';
import Booking from '../../database/models/Booking.js';
import Service from '../../database/models/Service.js';
import { UserRole, BookingStatus } from '../../core/enums.js';

export const getPlatformStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalAdmins,
    totalBookings,
    totalServices,
    recentBookings
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.USER }),
    User.countDocuments({ role: UserRole.PROVIDER }),
    User.countDocuments({ role: UserRole.ADMIN }),
    Booking.countDocuments(),
    Service.countDocuments(),
    Booking.find().sort('-createdAt').limit(5).populate('userId serviceId', 'name title')
  ]);

  const completedBookings = await Booking.find({ status: BookingStatus.COMPLETED });
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return {
    users: {
      total: totalUsers + totalProviders + totalAdmins,
      clients: totalUsers,
      providers: totalProviders,
      admins: totalAdmins
    },
    bookings: {
      total: totalBookings,
      completed: completedBookings.length,
      revenue: totalRevenue
    },
    services: {
      total: totalServices
    },
    recentBookings
  };
};

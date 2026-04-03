import Booking from '../booking/booking.model.js';
import User from '../auth/user.model.js';
import AppError from '../../utils/AppError.js';
import { todayRange } from '../../utils/utils-functions.js';

/**
 * Admin dashboard:
 *  - Total bookings today
 *  - Total revenue (sum of deposits) today
 *  - Overall revenue
 *  - All bookings list (paginated)
 *  - Employee performance (bookings per user)
 */

// export const getAdminDashboard = async (query) => {
//   const { date, page = 1, limit = 10 } = query;
//   const { start, end } = todayRange();

//   const [
//     [todayStats],
//     employeePerformance,
//     statusBreakdown,
//     [allTimeStats],
//     [retrievalStats],
//     [bookings, totalBookings],
//   ] = await Promise.all([
//     Booking.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//           status: { $ne: 'cancelled' },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalBookings: { $sum: 1 },
//           totalDepositsCollected: { $sum: '$deposit' },
//           totalRevenue: { $sum: '$totalPrice' },
//           totalRemaining: { $sum: '$remaining' },
//         },
//       },
//     ]),
//     Booking.aggregate([
//       { $match: { status: { $ne: 'cancelled' } } },
//       {
//         $group: {
//           _id: '$bookedBy',
//           totalBookings: { $sum: 1 },
//           totalRevenue: { $sum: '$totalPrice' },
//           depositsCollected: { $sum: '$deposit' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'employee',
//         },
//       },
//       { $unwind: '$employee' },
//       {
//         $project: {
//           _id: 0,
//           employeeId: '$_id',
//           name: '$employee.name',
//           email: '$employee.email',
//           totalBookings: 1,
//           totalRevenue: 1,
//           depositsCollected: 1,
//         },
//       },
//       { $sort: { totalBookings: -1 } },
//     ]),
//     Booking.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//     Booking.aggregate([
//       { $match: { status: { $ne: 'cancelled' } } },
//       {
//         $group: {
//           _id: null,
//           totalBookings: { $sum: 1 },
//           totalRevenue: { $sum: '$totalPrice' },
//           totalDeposits: { $sum: '$deposit' },
//         },
//       },
//     ]),
//     Booking.aggregate([
//       { $match: { status: 'retrieval' } },
//       {
//         $group: {
//           _id: null,
//           retrievalDiscount: { $sum: { $multiply: ['$totalPrice', 0.25] } },
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//     Promise.all([
//       Booking.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .populate('patient', 'name phone nationality')
//         .populate('bookedBy', 'name'),
//       Booking.countDocuments(filter),
//     ]),
//   ]);

//   const totalRevenue = allTimeStats?.totalRevenue || 0;
//   const retrievalDiscount = retrievalStats?.retrievalDiscount || 0;
//   const projectedRevenue = totalRevenue * 1.5;
//   const netProjected = projectedRevenue - retrievalDiscount;

//   return {
//     today: todayStats || {
//       totalBookings: 0,
//       totalDepositsCollected: 0,
//       totalRevenue: 0,
//       totalRemaining: 0,
//     },
//     allTime: allTimeStats || {
//       totalBookings: 0,
//       totalRevenue: 0,
//       totalDeposits: 0,
//     },
//     projectedRevenue,
//     retrievalDiscount,
//     netProjected,
//     employeePerformance,
//     statusBreakdown,
//     bookings,
//     totalBookings,
//     page: Number(page),
//     limit: Number(limit),
//   };
// };

export const getAdminDashboard = async (query) => {
  const { date, page = 1, limit = 10 } = query;
  const { start, end } = todayRange();

  // ── Today's stats ─────────────────────────────────────
  const [todayStats] = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalDepositsCollected: { $sum: '$deposit' },
        totalRevenue: { $sum: '$totalPrice' },
        totalRemaining: { $sum: '$remaining' },
      },
    },
  ]);

  // ── Employee performance (all time) ───────────────────
  const employeePerformance = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$bookedBy',
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        depositsCollected: { $sum: '$deposit' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $project: {
        _id: 0,
        employeeId: '$_id',
        name: '$employee.name',
        email: '$employee.email',
        totalBookings: 1,
        totalRevenue: 1,
        depositsCollected: 1,
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);

  // ── Bookings by status breakdown ──────────────────────
  const statusBreakdown = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // ── Recent bookings (paginated) ───────────────────────
  const skip = (page - 1) * limit;
  const filter = {};
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setHours(23, 59, 59, 999);
    filter.appointmentDate = { $gte: d, $lte: dEnd };
  }

  // ── All-time aggregate stats ─────────────────────────
  const [allTimeStats] = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        totalDeposits: { $sum: '$deposit' },
      },
    },
  ]);

  // ── Retrieval discount: sum of (totalPrice × 0.25) for retrieval bookings ─
  const [retrievalStats] = await Booking.aggregate([
    { $match: { status: 'retrieval' } },
    {
      $group: {
        _id: null,
        retrievalDiscount: { $sum: { $multiply: ['$totalPrice', 0.25] } },
        count: { $sum: 1 },
      },
    },
  ]);

  const [bookings, totalBookings] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patient', 'name phone nationality')
      .populate('bookedBy', 'name'),
    Booking.countDocuments(filter),
  ]);

  const totalRevenue = allTimeStats?.totalRevenue || 0;
  const retrievalDiscount = retrievalStats?.retrievalDiscount || 0;
  const projectedRevenue = totalRevenue * 1.5;
  const netProjected = projectedRevenue - retrievalDiscount;

  return {
    today: todayStats || {
      totalBookings: 0,
      totalDepositsCollected: 0,
      totalRevenue: 0,
      totalRemaining: 0,
    },
    allTime: allTimeStats || {
      totalBookings: 0,
      totalRevenue: 0,
      totalDeposits: 0,
    },
    projectedRevenue,
    retrievalDiscount,
    netProjected,
    employeePerformance,
    statusBreakdown,
    bookings,
    totalBookings,
    page: Number(page),
    limit: Number(limit),
  };
};

/**
 * Admin: get single employee detail with their bookings.
 */
export const getEmployeeDetail = async (employeeId, query = {}) => {
  const { from, to, page = 1, limit = 15 } = query;

  const user = await User.findById(employeeId).select(
    '-password -passwordConfirm',
  );
  if (!user) throw new AppError('No employee found with that ID.', 404);

  const filter = { bookedBy: employeeId, status: { $ne: 'cancelled' } };
  if (from || to) {
    filter.appointmentDate = {};
    if (from) {
      const d = new Date(from);
      d.setHours(0, 0, 0, 0);
      filter.appointmentDate.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      filter.appointmentDate.$lte = d;
    }
  }

  const skip = (page - 1) * limit;
  const [bookings, totalBookings] = await Promise.all([
    Booking.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patient', 'name phone'),
    Booking.countDocuments(filter),
  ]);

  const [stats] = await Booking.aggregate([
    { $match: { bookedBy: user._id, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        totalDeposits: { $sum: '$deposit' },
      },
    },
  ]);

  return {
    employee: user,
    bookings,
    totalBookings,
    page: Number(page),
    limit: Number(limit),
    stats: stats || { totalBookings: 0, totalRevenue: 0, totalDeposits: 0 },
  };
};

/**
 * Admin user management: list all users.
 */

export const getAllUsers = async ({ all = false } = {}) => {
  const filter = all ? {} : { isActive: true };
  const users = await User.find(filter)
    .select('-__v')
    .sort({ isActive: -1, createdAt: -1 });
  return users;
};

/**
 * Admin: reactivate a user account.
 */
export const reactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true },
  );
  if (!user) throw new AppError('No user found with that ID.', 404);
  return user;
};

/**
 * Admin: deactivate a user account.
 */

export const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true },
  );

  if (!user) throw new Error('No user found with that ID.');
  return user;
};

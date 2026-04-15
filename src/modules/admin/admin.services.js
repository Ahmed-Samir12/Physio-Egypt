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

export const getAdminDashboard = async (query) => {
  const { date, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // If a date is passed use it, otherwise default to today
  let start, end;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setHours(23, 59, 59, 999);
    start = d;
    end = dEnd;
  } else {
    ({ start, end } = todayRange());
  }

  const filter = {};
  if (date) {
    filter.appointmentDate = { $gte: start, $lte: end };
  }

  const [
    [todayStats],
    [allTimeStats],
    [allDepositsStats],
    [retrievalStats],
    employeePerformance,
    statusBreakdown,
    bookings,
    totalBookings,
  ] = await Promise.all([
    // 1. TODAY — deposits + bookings created today from money-received statuses
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['confirmed', 'done', 'retrieval'] },
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
    ]),

    // 2. ALL-TIME REVENUE — only confirmed + done (actual earned revenue)
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'done'] } } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]),

    // 3. ALL-TIME DEPOSITS — confirmed + done + retrieval (all statuses you got deposit from)
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'done', 'retrieval'] } } },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: '$deposit' },
        },
      },
    ]),

    // 4. RETRIEVAL — for discount calculation
    Booking.aggregate([
      { $match: { status: 'retrieval' } },
      {
        $group: {
          _id: null,
          retrievalDiscount: { $sum: { $multiply: ['$totalPrice', 0.75] } },
          count: { $sum: 1 },
        },
      },
    ]),

    // 5. EMPLOYEE PERFORMANCE
    Booking.aggregate([
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
    ]),

    // 6. STATUS BREAKDOWN
    Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // 7. BOOKINGS LIST (paginated)
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patient', 'name phone nationality')
      .populate('bookedBy', 'name'),

    // 8. TOTAL BOOKINGS COUNT (all ever, no filter)
    Booking.countDocuments(filter),
  ]);

  const totalRevenue = allTimeStats?.totalRevenue || 0;
  const retrievalDiscount = retrievalStats?.retrievalDiscount || 0;
  const projectedRevenue = totalRevenue * 1.5;
  const netProjected = projectedRevenue - retrievalDiscount;

  return {
    selectedDate: date || null,
    today: todayStats || {
      totalBookings: 0,
      totalDepositsCollected: 0,
      totalRevenue: 0,
      totalRemaining: 0,
    },
    allTime: {
      totalBookings: allTimeStats?.totalBookings || 0,
      totalRevenue: allTimeStats?.totalRevenue || 0,
      totalDeposits: allDepositsStats?.totalDeposits || 0, // from separate aggregate
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
  const { from, to, status, page = 1, limit = 15 } = query;

  const user = await User.findById(employeeId).select(
    '-password -passwordConfirm',
  );

  if (!user) throw new AppError('No employee found with that ID.', 404);

  // Build booking filter
  const filter = { bookedBy: employeeId };
  if (status) {
    // Specific status requested — honour it exactly
    filter.status = status;
  }

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
    { $match: { bookedBy: user._id, status: 'confirmed' } },
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

  if (!user) throw new AppError('No user found with that ID.', 404);
  return user;
};

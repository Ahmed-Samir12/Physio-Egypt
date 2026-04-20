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
  const { date, from, to, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  let start, end;
  if (from || to) {
    start = from ? new Date(from) : new Date('2000-01-01');
    start.setHours(0, 0, 0, 0);
    end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
  } else if (date) {
    start = new Date(date);
    start.setHours(0, 0, 0, 0);
    end = new Date(date);
    end.setHours(23, 59, 59, 999);
  } else {
    ({ start, end } = todayRange());
  }

  const filter = {};
  if (from || to || date) {
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
    selectedFrom: from || null,
    selectedTo: to || null,
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
  const { from, to, status, page = 1, limit = 10 } = query;

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

  const statsMatch = {
    bookedBy: user._id,
    status: { $in: ['confirmed', 'done'] },
    ...(filter.appointmentDate
      ? { appointmentDate: filter.appointmentDate }
      : {}),
  };

  const [stats] = await Booking.aggregate([
    { $match: statsMatch },
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
    filters: { from: from || null, to: to || null, status: status || null },
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

/**
 * Admin: change a user's role.
 * Only 'admin' can call this — enforced at route level.
 * Cannot demote/promote yourself.
 */

export const changeUserRole = async (
  targetUserId,
  newRole,
  requestingUserId,
) => {
  const allowedRoles = ['employee', 'mini-admin', 'admin'];
  if (!allowedRoles.includes(newRole)) {
    throw new AppError('الصلاحية غير صالحة.', 400);
  }

  if (String(targetUserId) === String(requestingUserId)) {
    throw new AppError('لا يمكنك تغيير صلاحيتك الخاصة.', 400);
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role: newRole },
    { new: true, runValidators: true },
  );

  if (!user) throw new AppError('لم يتم العثور على المستخدم.', 404);
  return user;
};

/**
 * Employee performance summary — for mini-admin dashboard.
 * Same aggregate as admin dashboard but exposed separately.
 */
export const getEmployeePerformance = async () => {
  const results = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$bookedBy',
        totalBookings: { $sum: 1 },
        confirmedBookings: {
          $sum: { $cond: [{ $in: ['$status', ['confirmed', 'done']] }, 1, 0] },
        },
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
        role: '$employee.role',
        isActive: '$employee.isActive',
        totalBookings: 1,
        confirmedBookings: 1,
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);

  return results;
};

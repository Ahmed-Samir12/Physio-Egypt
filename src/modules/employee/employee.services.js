import Booking from '../booking/booking.model.js';

/**
 * Employee dashboard:
 *  - Number of bookings they created today
 *  - Full list of their bookings today
 *  - Their all-time stats
 */

export const getEmployeeDashboard = async (employeeId, query) => {
  const { date, page = 1, limit = 10 } = query;

  // Build date filter (default: today)
  const targetDate = date ? new Date(date) : new Date();
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  const skip = (page - 1) * limit;

  // ── Today's bookings ──────────────────────────────────
  const [todayStats] = await Booking.aggregate([
    {
      $match: {
        bookedBy: employeeId,
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'done', 'retrieval'] },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        depositsCollected: { $sum: '$deposit' },
      },
    },
  ]);

  // ── Today's booking list ──────────────────────────────
  const [todayBookings, todayTotal] = await Promise.all([
    Booking.find({
      bookedBy: employeeId,
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ appointmentTime: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patient', 'name phone address nationality')
      .populate('bookedBy', 'name email'),
    Booking.countDocuments({
      bookedBy: employeeId,
      createdAt: { $gte: start, $lte: end },
    }),
  ]);

  // ── All-time stats ────────────────────────────────────
  const [allTimeStats] = await Booking.aggregate([
    {
      $match: {
        bookedBy: employeeId,
        status: { $in: ['confirmed', 'done'] },
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        depositsCollected: { $sum: '$deposit' },
      },
    },
  ]);

  return {
    today: {
      date: targetDate.toDateString(),
      bookingsCount: todayStats?.count || 0,
      depositsCollected: todayStats?.depositsCollected || 0,
    },
    allTime: allTimeStats || {
      totalBookings: 0,
      totalRevenue: 0,
      depositsCollected: 0,
    },
    bookings: todayBookings,
    total: todayTotal,
    page: Number(page),
    limit: Number(limit),
  };
};

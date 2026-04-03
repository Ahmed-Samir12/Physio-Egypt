import Booking from './booking.model.js';
import * as patientService from '../patient/patient.services.js';
import AppError from '../../utils/AppError.js';
import Patient from '../patient/patientModel.js';
import { escapeRegex, todayRange } from '../../utils/utils-functions.js';
/**
 * Create a booking.
 *
 * Flow:
 *  1. Find or create patient by phone
 *  2. Validate deposit <= totalPrice
 *  3. Create booking (remaining + paymentStatus calculated in model hook)
 *  4. Send notification (non-blocking — failure won't roll back booking)
 */

export const createBooking = async (bookingData, employeeId) => {
  // Support both nested shape {patient:{...}, booking:{...}} from frontend
  // and flat shape for backward compat
  const patientData = bookingData.patient || bookingData;
  const bookingInfo = bookingData.booking || bookingData;

  const {
    phone,
    name,
    age,
    address,
    gender,
    nationality,
    notes: patientNotes,
    complaint,
    whatsappNumber,
  } = patientData;

  const {
    appointmentDate,
    appointmentTime,
    serviceType,
    totalPrice,
    deposit = 0,
    notes,
    companion = '',
  } = bookingInfo;

  // Step 1: resolve patient
  const { patient, isNew } = await patientService.findOrCreateByPhone(
    {
      phone,
      name,
      age,
      address,
      gender,
      nationality,
      notes: patientNotes,
      complaint,
      whatsappNumber,
    },
    employeeId,
  );

  // Step 2: create booking
  let booking;
  try {
    booking = await Booking.create({
      patient: patient._id,
      bookedBy: employeeId,
      appointmentDate,
      appointmentTime,
      serviceType,
      totalPrice,
      deposit,
      companion,
      notes,
      status: 'pending',
    });
  } catch (err) {
    // Duplicate key on compound index → slot already taken
    if (err.code === 11000) {
      throw new AppError(
        `This time slot (${appointmentTime} on ${new Date(appointmentDate).toDateString()}) is already booked.`,
        409,
      );
    }
    throw err;
  }

  // Populate for response
  await booking.populate([
    {
      path: 'patient',
      select:
        'patientId name phone age gender address nationality complaint whatsappNumber',
    },
    { path: 'bookedBy', select: 'name email' },
  ]);

  return { booking, patientIsNew: isNew };
};

/**
 * List bookings with optional filters.
 * Employees only see their own bookings; admins see all.
 */

export const getBookings = async (query, user) => {
  const { date, status, page = 1, limit = 10, search, patientId } = query;
  const skip = (page - 1) * limit;

  const filter = {};

  // Employees are scoped to their own bookings
  if (user.role === 'employee') {
    filter.bookedBy = user._id;
  }

  if (date) {
    const { start, end } = todayRange();
    filter.appointmentDate = { $gte: start, $lte: end };
  }

  if (status) filter.status = status;

  // Filter by specific patient (used by patient detail page)
  if (patientId) filter.patient = patientId;

  // Text search across patient name / phone — requires a lookup
  // We do a two-step approach: find matching patients first, then filter bookings
  if (search && !patientId) {
    const matchingPatients = await Patient.find({
      $or: [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { phone: { $regex: escapeRegex(search), $options: 'i' } },
        { nationality: { $regex: escapeRegex(search), $options: 'i' } },
      ],
    })
      .select('_id')
      .lean()
      .limit(200);
    filter.patient = { $in: matchingPatients.map((p) => p._id) };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(
        'patient',
        'patientId name phone age gender address nationality complaint whatsappNumber',
      )
      .populate('bookedBy', 'name email'),
    Booking.countDocuments(filter),
  ]);

  return { bookings, total, page: Number(page), limit: Number(limit) };
};

/**
 * Get single booking by ID.
 * Employees can only access their own bookings.
 */

export const getBookingById = async (id, user) => {
  const booking = await Booking.findById(id)
    .populate(
      'patient',
      'patientId name phone age gender address nationality complaint whatsappNumber',
    )
    .populate('bookedBy', 'name email');

  if (!booking) throw new AppError('No booking found with that ID.', 404);

  if (
    user.role === 'employee' &&
    booking.bookedBy._id.toString() !== user._id.toString()
  ) {
    throw new AppError('You do not have permission to view this booking.', 403);
  }

  return booking;
};

/**
 * Update booking status or payment info.
 */

export const updateBooking = async (id, data, user) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('No booking found with that ID.', 404);

  if (
    user.role === 'employee' &&
    booking.bookedBy.toString() !== user._id.toString()
  ) {
    throw new AppError(
      'You do not have permission to update this booking.',
      403,
    );
  }

  // Allow updating these fields
  const allowed = [
    'status',
    'deposit',
    'totalPrice',
    'notes',
    'companion',
    'appointmentDate',
    'appointmentTime',
  ];

  allowed.forEach((field) => {
    if (data[field] !== undefined) booking[field] = data[field];
  });

  await booking.save(); // triggers pre-save hook to recalculate remaining

  await booking.populate([
    {
      path: 'patient',
      select:
        'patientId name phone age gender address nationality complaint whatsappNumber',
    },
    { path: 'bookedBy', select: 'name email' },
  ]);

  return booking;
};

/**
 * Cancel a booking (soft delete via status change).
 */

export const cancelBooking = async (id, user) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('No booking found with that ID.', 404);

  if (
    user.role === 'employee' &&
    booking.bookedBy.toString() !== user._id.toString()
  ) {
    throw new AppError(
      'You do not have permission to cancel this booking.',
      403,
    );
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking;
};

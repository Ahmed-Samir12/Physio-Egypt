import * as bookingService from './booking.services.js';
import { buildCardHTML } from '../../utils/patientCard.js';
import Booking from './booking.model.js';
import Patient from '../patient/patientModel.js';

export const createBooking = async (req, res) => {
  const { booking, patientIsNew } = await bookingService.createBooking(
    req.body,
    req.user._id,
  );
  res.status(201).json({
    status: 'success',
    message: `Booking created. Patient was ${patientIsNew ? 'newly registered' : 'found in system'}.`,
    data: { booking },
  });
};

export const getAllBookings = async (req, res) => {
  const result = await bookingService.getBookings(req.query, req.user);
  res.status(200).json({ status: 'success', data: { ...result } });
};

export const getBookingById = async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  res.status(200).json({ status: 'success', data: { booking } });
};

export const updateBooking = async (req, res) => {
  const booking = await bookingService.updateBooking(
    req.params.id,
    req.body,
    req.user,
  );
  res.status(200).json({ status: 'success', data: { booking } });
};

export const cancelBooking = async (req, res) => {
  await bookingService.cancelBooking(req.params.id, req.user);
  res.status(200).json({ status: 'success', message: 'Booking cancelled' });
};

// GET /api/v1/bookings/:id/card         → HTML printable card
// GET /api/v1/bookings/:id/card?print=1 → same HTML, auto-prints via JS

export const getBookingCard = async (req, res) => {
  const booking = await Booking.findById(req.params.id).lean();
  if (!booking)
    return res
      .status(404)
      .json({ status: 'fail', message: 'Booking not found' });

  const patient = await Patient.findById(booking.patient).lean();
  if (!patient)
    return res
      .status(404)
      .json({ status: 'fail', message: 'Patient not found' });

  const autoPrint = req.query.print === '1';
  const nonce = res.locals.cspNonce; // set by your CSP middleware

  const html = buildCardHTML({ patient, booking, nonce, autoPrint });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(html);
};

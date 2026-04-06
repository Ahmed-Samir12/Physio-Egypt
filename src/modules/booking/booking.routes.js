import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import * as bookingController from './booking.controller.js';

const router = express.Router();

router.use(protect);

// Patient card — GET /api/v1/bookings/:id/card
// Add ?pdf=1 to get a PDF instead of HTML
router.get('/:id/card', bookingController.getBookingCard);

router
  .route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBookingById)
  .patch(bookingController.updateBooking);

router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;

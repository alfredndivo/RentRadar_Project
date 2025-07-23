import express from 'express';
import {
  createBooking,
  getUserBookings,
  getLandlordBookings,
  updateBookingStatus,
  getBookingById,
  uploadBookingPhotos
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect());

// Create booking (tenant only)
router.post('/', createBooking);

// Get user's bookings
router.get('/my-bookings', getUserBookings);

// Get landlord's bookings
router.get('/landlord-bookings', getLandlordBookings);

// Get single booking
router.get('/:id', getBookingById);

// Update booking status (landlord only)
router.patch('/:id/status', updateBookingStatus);

// Upload photos after visit (tenant only)
router.post('/:id/photos', upload.array('photos', 5), uploadBookingPhotos);

export default router;
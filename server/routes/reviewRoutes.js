import express from 'express';
import {
  leaveReview,
  getReviewsByTarget,
  deleteReview,
  getUserReviews,
  getLandlordReviews,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// 🔐 Authenticated user leaves a review
router.post('/', protect(), leaveReview);

// 🌍 Public or logged-in fetch reviews by target
router.get('/:targetType/:targetId', getReviewsByTarget);

// Get user's own reviews
router.get('/my', protect(), getUserReviews);

// Get landlord's received reviews
router.get('/landlord/my', protect(), getLandlordReviews);

// Get all reviews for admin
router.get('/admin/all', protect(), roleCheck(['admin', 'superadmin']), getAllReviews);

// 🔒 Delete a review
router.delete('/:id', protect(), deleteReview);

export default router;
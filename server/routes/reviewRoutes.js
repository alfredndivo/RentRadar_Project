// server/routes/reviewRoutes.js

import express from 'express';
import {
  leaveReview,
  getReviewsByTarget,
  deleteReview
} from '../controllers/reviewController.js';
import Review from '../models/Review.js';
import {protect} from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// 🔐 Authenticated user leaves a review
router.post('/', protect(), leaveReview);

// 🌍 Public or logged-in fetch reviews by target
// Example: /api/reviews/listing/648a... OR /api/reviews/landlord/648b...
router.get('/:targetType/:targetId', getReviewsByTarget);

// Get user's own reviews
router.get('/my', protect(), async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get landlord's received reviews
router.get('/landlord/my', protect(), async (req, res) => {
  try {
    const reviews = await Review.find({ 
      $or: [
        { targetType: 'landlord', targetId: req.user._id },
        { targetType: 'listing', targetId: { $in: await getMyListingIds(req.user._id) } }
      ]
    })
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get all reviews for admin
router.get('/admin/all', protect(), roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// 🔒 Admin deletes a review
router.delete('/:id', protect(), roleCheck(['admin', 'superadmin']), deleteReview);

// Helper function to get landlord's listing IDs
async function getMyListingIds(landlordId) {
  const { default: Listing } = await import('../models/Listing.js');
  const listings = await Listing.find({ landlord: landlordId }).select('_id');
  return listings.map(listing => listing._id);
}

export default router;

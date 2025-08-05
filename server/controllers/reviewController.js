import Review from '../models/Review.js';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Listing from '../models/Listing.js';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// 📝 Leave a new review
export const leaveReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId || !rating) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ reviewedBy: userId, targetType, targetId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this' });
    }

    // Verify target exists
    let targetExists = false;
    let targetName = '';
    
    if (targetType === 'listing') {
      const listing = await Listing.findById(targetId).populate('landlord');
      if (listing) {
        targetExists = true;
        targetName = listing.title;
        
        // Notify landlord about new review
        await createNotification({
          userId: listing.landlord._id,
          userType: 'Landlord',
          type: 'review',
          title: '⭐ New Review Received',
          message: `Your property "${listing.title}" received a ${rating}-star review`,
          link: '/landlord/reviews',
          priority: 'medium'
        });
      }
    } else if (targetType === 'landlord') {
      const landlord = await Landlord.findById(targetId);
      if (landlord) {
        targetExists = true;
        targetName = landlord.name;
        
        // Notify landlord about new review
        await createNotification({
          userId: landlord._id,
          userType: 'Landlord',
          type: 'review',
          title: '⭐ New Review Received',
          message: `You received a ${rating}-star review`,
          link: '/landlord/reviews',
          priority: 'medium'
        });
      }
    }

    if (!targetExists) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    const review = new Review({
      reviewedBy: userId,
      targetType,
      targetId,
      rating,
      comment: comment || ''
    });

    await review.save();

    // Populate the review for response
    await review.populate('reviewedBy', 'name email');

    res.status(201).json({ 
      message: 'Review submitted successfully', 
      review 
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// 📖 Get reviews for a listing or landlord
export const getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.find({ targetType, targetId })
      .populate('reviewedBy', 'name photo')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating),
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length
        }
      }
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get user's own reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedBy: req.user._id })
      .populate({
        path: 'targetId',
        select: 'title name location'
      })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get landlord's received reviews
export const getLandlordReviews = async (req, res) => {
  try {
    // Get reviews for landlord directly
    const landlordReviews = await Review.find({ 
      targetType: 'landlord', 
      targetId: req.user._id 
    })
    .populate('reviewedBy', 'name photo')
    .sort({ createdAt: -1 });

    // Get reviews for landlord's listings
    const { default: Listing } = await import('../models/Listing.js');
    const listings = await Listing.find({ landlord: req.user._id }).select('_id');
    const listingIds = listings.map(listing => listing._id);
    
    const listingReviews = await Review.find({ 
      targetType: 'listing', 
      targetId: { $in: listingIds }
    })
    .populate('reviewedBy', 'name photo')
    .populate('targetId', 'title location')
    .sort({ createdAt: -1 });

    const allReviews = [...landlordReviews, ...listingReviews];
    
    // Calculate stats
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;

    res.json({
      reviews: allReviews,
      stats: {
        totalReviews: allReviews.length,
        averageRating: parseFloat(averageRating),
        ratingDistribution: {
          5: allReviews.filter(r => r.rating === 5).length,
          4: allReviews.filter(r => r.rating === 4).length,
          3: allReviews.filter(r => r.rating === 3).length,
          2: allReviews.filter(r => r.rating === 2).length,
          1: allReviews.filter(r => r.rating === 1).length
        }
      }
    });
  } catch (err) {
    console.error('Error fetching landlord reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get all reviews for admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewedBy', 'name email photo')
      .populate({
        path: 'targetId',
        select: 'title name location'
      })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// 🗑️ Delete a review (user can delete their own, admin can delete any)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'superadmin' && review.reviewedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};
// server/controllers/reviewController.js

import Review from '../models/Review.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// 📝 Leave a new review
export const leaveReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId || !rating) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ reviewedBy: userId, targetType, targetId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this' });
    }

    const review = new Review({
      reviewedBy: userId,
      targetType,
      targetId,
      rating,
      comment
    });

    await review.save();

    // 📬 Email the landlord if it's a landlord review
    if (targetType === 'landlord') {
      const landlord = await User.findById(targetId);
      if (landlord && landlord.email) {
        await sendEmail({
          to: landlord.email,
          subject: '🌟 New Review Received on RentRadar',
          html: `<p>Hello ${landlord.username},</p>
                 <p>You just received a new review:</p>
                 <ul>
                   <li>Rating: ${rating} ⭐</li>
                   <li>Comment: ${comment || 'No comment provided'}</li>
                 </ul>
                 <p>Login to your dashboard to view more.</p>`
        });
      }
    }

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to leave review' });
  }
};

// 📖 Get reviews for a listing or landlord
export const getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.find({ targetType, targetId })
      .populate('reviewedBy', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// 🗑️ Admin: Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

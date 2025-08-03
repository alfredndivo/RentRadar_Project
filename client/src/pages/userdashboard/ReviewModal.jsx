import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitReview } from '../../../api';

const ReviewModal = ({ isOpen, onClose, targetId, targetType, targetTitle }) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.rating) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await submitReview({
        targetType,
        targetId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      toast.success('Review submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Write Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reviewing {targetType}:
            </p>
            <p className="text-gray-900 dark:text-white font-semibold">
              {targetTitle || `${targetType} #${targetId?.slice(-6)}`}
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Your Rating *
            </label>
            <div className="flex items-center justify-center">
              {renderStars(reviewData.rating, true)}
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {reviewData.rating === 5 && "Excellent!"}
              {reviewData.rating === 4 && "Very Good"}
              {reviewData.rating === 3 && "Good"}
              {reviewData.rating === 2 && "Fair"}
              {reviewData.rating === 1 && "Poor"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Review Guidelines:</strong> Please be honest and constructive. 
              Reviews help other users make informed decisions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
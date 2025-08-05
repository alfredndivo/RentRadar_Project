import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Heart, MessageCircle, Share2, Calendar, Phone, Mail, Flag, Star, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LocationMap from '../../components/LocationMap';
import ImageLightbox from '../../components/ImageLightbox';
import ReportModal from './ReportModal';
import ReviewModal from './ReviewModal';

const ListingDetailsModal = ({ listing, onClose, onContact, onSave, isSaved, onBook }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);

  React.useEffect(() => {
    fetchReviews();
  }, [listing._id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews/listing/${listing._id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setReviewStats(data.stats || { totalReviews: 0, averageRating: 0 });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this property: ${listing.title} in ${listing.location}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const handleCall = () => {
    if (listing.landlord?.phone) {
      window.location.href = `tel:${listing.landlord.phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleEmail = () => {
    if (listing.landlord?.email) {
      window.location.href = `mailto:${listing.landlord.email}?subject=Inquiry about ${listing.title}&body=Hi, I'm interested in your property "${listing.title}" located at ${listing.location}. Could you please provide more details?`;
    } else {
      toast.error('Email not available');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="relative mb-6">
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src={getImageUrl(listing.images[currentImageIndex])}
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(currentImageIndex);
                    setLightboxOpen(true);
                  }}
                />
              </div>

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition-colors shadow-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition-colors shadow-lg"
                  >
                    →
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{listing.location}</span>
                  <div className="flex items-center gap-1 ml-4">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{listing.views || 0} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    {listing.houseType}
                  </span>
                  {listing.bedrooms > 0 && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Bed className="w-4 h-4" />
                      <span>{listing.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {listing.bathrooms > 0 && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Bath className="w-4 h-4" />
                      <span>{listing.bathrooms} Bathrooms</span>
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                  KES {listing.price?.toLocaleString()}
                  <span className="text-lg text-gray-600 dark:text-gray-300 font-normal">
                    /month
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Property Features
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Spacious rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Modern amenities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Good location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Secure environment</span>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Reviews ({reviewStats.totalReviews})
                  </h3>
                  {reviewStats.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(reviewStats.averageRating))}
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {reviewStats.averageRating}
                      </span>
                    </div>
                  )}
                </div>

                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Star className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">No reviews yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to review this property</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {review.reviewedBy?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {review.reviewedBy?.name || 'Anonymous'}
                              </p>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                        )}
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <p className="text-center text-sm text-blue-600 dark:text-blue-400">
                        +{reviews.length - 3} more reviews
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Posted on {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Map */}
              {listing.lat && listing.lng && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Location
                  </h3>
                  <LocationMap lat={listing.lat} lng={listing.lng} title={listing.title} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 space-y-4">
                <button
                  onClick={onContact}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Landlord
                </button>

                {onBook && (
                  <button
                    onClick={onBook}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Visit
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-colors ${
                      isSaved
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-2 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Report and Review Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 px-4 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>

                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 py-2 px-4 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Review
                  </button>
                </div>

                {/* Alternative Contact Methods */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Or contact directly:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCall}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button
                      onClick={handleEmail}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Landlord Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Property Owner
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {listing.landlord?.name?.charAt(0) || "L"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.landlord?.name || "Property Owner"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Verified Landlord</p>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Response rate: 95%</p>
                  <p>Responds within 2 hours</p>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Safety Tips
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Always visit the property in person</li>
                  <li>• Verify landlord identity</li>
                  <li>• Don't send money before viewing</li>
                  <li>• Use secure payment methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ImageLightbox
        images={listing.images?.map(getImageUrl) || []}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetId={listing._id}
          targetType="listing"
          onSubmit={async (reportData) => {
            try {
              const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(reportData)
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
              }

              toast.success('Report submitted successfully');
              setShowReportModal(false);
            } catch (error) {
              console.error('Error submitting report:', error);
              toast.error(error.message || 'Failed to submit report');
            }
          }}
        />
      )}
      
      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          targetId={listing._id}
          targetType="listing"
          targetTitle={listing.title}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
};

export default ListingDetailsModal;
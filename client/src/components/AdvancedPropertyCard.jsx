import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Bed, 
  Bath, 
  Star, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  GitCompare,
  Share2,
  Camera,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

const AdvancedPropertyCard = ({ 
  listing, 
  onSave, 
  onContact, 
  onBook, 
  onViewDetails, 
  onAddToComparison,
  isSaved = false,
  showVirtualTour = false,
  showAnalytics = false 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const getPriorityBadge = () => {
    const isNew = (Date.now() - new Date(listing.createdAt)) < 7 * 24 * 60 * 60 * 1000;
    const isPopular = (listing.views || 0) > 50;
    const isFeatured = listing.featured;

    if (isFeatured) return { text: 'Featured', color: 'bg-purple-500', icon: <Star className="w-3 h-3" /> };
    if (isNew) return { text: 'New', color: 'bg-green-500', icon: <Zap className="w-3 h-3" /> };
    if (isPopular) return { text: 'Popular', color: 'bg-blue-500', icon: <TrendingUp className="w-3 h-3" /> };
    return null;
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
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const priorityBadge = getPriorityBadge();

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-green-100 dark:border-gray-700 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(listing.images?.[currentImageIndex] || listing.images?.[0])}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "/placeholder.png";
          }}
        />
        
        {/* Image Navigation */}
        {listing.images && listing.images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
            >
              →
            </button>
          </>
        )}

        {/* Priority Badge */}
        {priorityBadge && (
          <div className={`absolute top-3 left-3 ${priorityBadge.color} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse`}>
            {priorityBadge.icon}
            {priorityBadge.text}
          </div>
        )}

        {/* Verified Badge */}
        {listing.landlord?.badge && (
          <div className="absolute top-3 right-12 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={() => onSave(listing._id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all transform hover:scale-110 ${
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              {showVirtualTour && (
                <button
                  onClick={() => onViewDetails(listing)}
                  className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-colors"
                  title="Virtual Tour"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => onAddToComparison(listing)}
                className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-colors"
                title="Add to comparison"
              >
                <GitCompare className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-colors"
                title="Share property"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Image Count Indicator */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {currentImageIndex + 1}/{listing.images.length}
          </div>
        )}

        {/* View Count */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {listing.views || 0}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
            {listing.title}
          </h3>
          <span className="text-xl font-bold text-green-600 dark:text-green-400 ml-2">
            KES {listing.price?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{listing.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg">
            {listing.houseType}
          </span>
          {listing.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{listing.bedrooms}</span>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{listing.bathrooms}</span>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-800 dark:text-purple-300">AI Insight</span>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-400">
            {listing.price < 20000 ? 'Great value for money in this area' :
             listing.views > 30 ? 'High interest property - act fast!' :
             'Perfect match for your search criteria'}
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => onBook(listing)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book
            </button>
          </div>
          
          <button
            onClick={() => onContact(listing)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Landlord
          </button>
        </div>

        {/* Property Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {listing.saves || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {listing.inquiries || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Animation */}
      <div className={`absolute inset-0 border-2 border-green-500 rounded-2xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};

export default AdvancedPropertyCard;
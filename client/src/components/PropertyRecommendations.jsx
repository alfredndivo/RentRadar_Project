import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, MapPin, DollarSign, Eye, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { getAllListings, saveListing } from '../../api';

const PropertyRecommendations = ({ userPreferences, currentLocation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences, currentLocation]);

  const generateRecommendations = async () => {
    try {
      const response = await getAllListings();
      const allListings = response.data || [];
      
      // Simple recommendation algorithm
      const scored = allListings.map(listing => {
        let score = 0;
        
        // Price preference scoring
        if (userPreferences?.maxBudget) {
          if (listing.price <= userPreferences.maxBudget) {
            score += 30;
          } else if (listing.price <= userPreferences.maxBudget * 1.2) {
            score += 15;
          }
        }
        
        // Location preference
        if (userPreferences?.preferredLocations?.some(loc => 
          listing.location.toLowerCase().includes(loc.toLowerCase())
        )) {
          score += 25;
        }
        
        // Property type preference
        if (userPreferences?.preferredTypes?.includes(listing.houseType)) {
          score += 20;
        }
        
        // Popularity boost
        score += Math.min((listing.views || 0) / 10, 15);
        
        // Recency boost
        const daysOld = (Date.now() - new Date(listing.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) score += 10;
        
        return { ...listing, score };
      });
      
      // Sort by score and take top 6
      const topRecommendations = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      
      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveListing = async (listingId) => {
    try {
      await saveListing(listingId);
      toast.success('Property saved to favorites');
    } catch (error) {
      toast.error('Failed to save property');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const getRecommendationReason = (listing) => {
    if (userPreferences?.maxBudget && listing.price <= userPreferences.maxBudget) {
      return "Within your budget";
    }
    if (listing.views > 50) {
      return "Popular choice";
    }
    if (userPreferences?.preferredLocations?.some(loc => 
      listing.location.toLowerCase().includes(loc.toLowerCase())
    )) {
      return "In your preferred area";
    }
    return "Recommended for you";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended for You</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Properties that match your preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((listing) => (
          <div key={listing._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="relative mb-3">
              <img
                src={getImageUrl(listing.images?.[0])}
                alt={listing.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {Math.round(listing.score)}%
              </div>
              <button
                onClick={() => handleSaveListing(listing._id)}
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
              >
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
              {listing.title}
            </h4>
            
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-2">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{listing.location}</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-green-600 dark:text-green-400">
                KES {listing.price?.toLocaleString()}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Eye className="w-3 h-3" />
                {listing.views || 0}
              </div>
            </div>
            
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {getRecommendationReason(listing)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyRecommendations;
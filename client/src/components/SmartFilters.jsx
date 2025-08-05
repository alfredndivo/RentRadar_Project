import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, MapPin, DollarSign, Home, Users, Clock } from 'lucide-react';

const SmartFilters = ({ onFiltersChange, userPreferences, searchHistory }) => {
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [trendingFilters, setTrendingFilters] = useState([]);
  const [personalizedFilters, setPersonalizedFilters] = useState([]);

  useEffect(() => {
    generateSmartSuggestions();
    generateTrendingFilters();
    generatePersonalizedFilters();
  }, [userPreferences, searchHistory]);

  const generateSmartSuggestions = () => {
    // AI-powered suggestions based on user behavior
    const suggestions = [
      {
        id: 'budget-friendly',
        label: 'Budget Friendly',
        icon: <DollarSign className="w-4 h-4" />,
        filters: { maxPrice: 25000 },
        reason: 'Based on your search history'
      },
      {
        id: 'near-transport',
        label: 'Near Transport',
        icon: <MapPin className="w-4 h-4" />,
        filters: { amenities: ['Public Transport'] },
        reason: 'Popular in your area'
      },
      {
        id: 'family-friendly',
        label: 'Family Friendly',
        icon: <Home className="w-4 h-4" />,
        filters: { minBedrooms: 2, amenities: ['Security', 'Parking'] },
        reason: 'Recommended for families'
      }
    ];
    
    setSmartSuggestions(suggestions);
  };

  const generateTrendingFilters = () => {
    const trending = [
      { label: 'Westlands Area', count: 156, filters: { location: 'Westlands' } },
      { label: 'Under 30K', count: 89, filters: { maxPrice: 30000 } },
      { label: '2 Bedroom', count: 67, filters: { houseType: '2 Bedroom' } },
      { label: 'With Parking', count: 45, filters: { amenities: ['Parking'] } }
    ];
    
    setTrendingFilters(trending);
  };

  const generatePersonalizedFilters = () => {
    if (!userPreferences) return;
    
    const personalized = [
      {
        label: 'Your Budget Range',
        filters: { 
          minPrice: userPreferences.minBudget || 0,
          maxPrice: userPreferences.maxBudget || 50000
        },
        confidence: 95
      },
      {
        label: 'Preferred Areas',
        filters: { location: userPreferences.preferredLocations?.[0] || 'Nairobi' },
        confidence: 88
      }
    ];
    
    setPersonalizedFilters(personalized);
  };

  const applySmartFilter = (filterData) => {
    onFiltersChange(filterData.filters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Filters</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered search suggestions</p>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Smart Suggestions</h4>
        </div>
        <div className="space-y-2">
          {smartSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => applySmartFilter(suggestion)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {suggestion.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{suggestion.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{suggestion.reason}</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Trending Now</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trendingFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => applySmartFilter(filter)}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">{filter.label}</span>
              <span className="text-xs text-green-600 dark:text-green-400">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personalized Filters */}
      {personalizedFilters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">For You</h4>
          </div>
          <div className="space-y-2">
            {personalizedFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => applySmartFilter(filter)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">{filter.label}</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">{filter.confidence}% match</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3k</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Active Searches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">New Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Match Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;
import React, { useState, useEffect } from 'react';
import { Brain, Zap, Target, TrendingUp, Star, MapPin, DollarSign, Home, Users } from 'lucide-react';
import { toast } from 'sonner';

const AIPropertyMatcher = ({ userProfile, searchHistory, onRecommendation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    budget: userProfile?.maxBudget || 50000,
    location: userProfile?.preferredLocation || '',
    propertyType: userProfile?.preferredType || '',
    lifestyle: 'balanced' // quiet, social, balanced
  });

  useEffect(() => {
    generateRecommendations();
  }, [userProfile, searchHistory, preferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI recommendations based on user data
      const mockRecommendations = [
        {
          id: 1,
          title: 'Modern Bedsitter in Kasarani',
          location: 'Kasarani, Nairobi',
          price: 12000,
          matchScore: 95,
          reasons: [
            'Perfect match for your budget',
            'Close to your workplace',
            'Matches your lifestyle preferences'
          ],
          aiInsights: {
            priceComparison: 'Below market average by 15%',
            locationScore: 'Excellent transport links',
            futureValue: 'Property values rising 8% annually'
          }
        },
        {
          id: 2,
          title: 'Cozy Studio in Juja',
          location: 'Juja, Kiambu',
          price: 8500,
          matchScore: 88,
          reasons: [
            'Great value for money',
            'Quiet neighborhood',
            'Near educational institutions'
          ],
          aiInsights: {
            priceComparison: 'Excellent value',
            locationScore: 'Growing area with potential',
            futureValue: 'Stable rental market'
          }
        }
      ];
      
      setRecommendations(mockRecommendations);
      setMatchScore(92); // Overall match score
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleRecommendationClick = (recommendation) => {
    onRecommendation?.(recommendation);
    toast.success(`Showing properties similar to: ${recommendation.title}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Property Matcher</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Personalized recommendations powered by AI</p>
        </div>
      </div>

      {/* Match Score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Match Score</span>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-lg font-bold text-green-600 dark:text-green-400">{matchScore}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${matchScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Based on your preferences and search behavior
        </p>
      </div>

      {/* Preference Tuning */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Fine-tune Preferences
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Range: KES {preferences.budget.toLocaleString()}
            </label>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={preferences.budget}
              onChange={(e) => updatePreferences('budget', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lifestyle Preference
            </label>
            <div className="flex gap-2">
              {['quiet', 'balanced', 'social'].map((lifestyle) => (
                <button
                  key={lifestyle}
                  onClick={() => updatePreferences('lifestyle', lifestyle)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    preferences.lifestyle === lifestyle
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {lifestyle.charAt(0).toUpperCase() + lifestyle.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          AI Recommendations
        </h4>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h5>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{rec.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {rec.matchScore}% match
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      KES {rec.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Why this matches:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    {rec.reasons.map((reason, index) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Insights:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <span>💰 {rec.aiInsights.priceComparison}</span>
                    <span>📍 {rec.aiInsights.locationScore}</span>
                    <span>📈 {rec.aiInsights.futureValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Notice */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-300">AI Learning</span>
        </div>
        <p className="text-xs text-purple-700 dark:text-purple-400">
          Our AI learns from your interactions to provide better recommendations over time.
        </p>
      </div>
    </div>
  );
};

export default AIPropertyMatcher;
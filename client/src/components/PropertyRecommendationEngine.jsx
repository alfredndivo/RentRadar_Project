import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, MapPin, DollarSign, Home, Star, Zap, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PropertyRecommendationEngine = ({ userId, userPreferences, onRecommendationSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingAlgorithm, setMatchingAlgorithm] = useState('hybrid'); // collaborative, content, hybrid
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [learningProgress, setLearningProgress] = useState(0);

  useEffect(() => {
    generateRecommendations();
  }, [userId, userPreferences, matchingAlgorithm]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI processing with different algorithms
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRecommendations = [
        {
          id: 1,
          title: 'AI-Recommended Bedsitter in Githurai',
          location: 'Githurai, Nairobi',
          price: 8500,
          matchScore: 96,
          confidence: 'Very High',
          algorithm: 'Hybrid Filtering',
          reasons: [
            'Matches your budget perfectly (±5%)',
            'Similar users loved this property',
            'Excellent transport connectivity',
            'Safe neighborhood based on reviews'
          ],
          aiMetrics: {
            priceOptimality: 92,
            locationScore: 88,
            safetyRating: 94,
            transportScore: 90
          },
          predictedSatisfaction: 94,
          similarUserRating: 4.6
        },
        {
          id: 2,
          title: 'Smart Match: Studio in Juja',
          location: 'Juja, Kiambu',
          price: 7200,
          matchScore: 89,
          confidence: 'High',
          algorithm: 'Content-Based',
          reasons: [
            'Great value proposition',
            'Matches your lifestyle pattern',
            'Growing area with potential',
            'Low competition ratio'
          ],
          aiMetrics: {
            priceOptimality: 96,
            locationScore: 82,
            safetyRating: 87,
            transportScore: 85
          },
          predictedSatisfaction: 87,
          similarUserRating: 4.3
        },
        {
          id: 3,
          title: 'Trending: 1BR in Kahawa West',
          location: 'Kahawa West, Nairobi',
          price: 15000,
          matchScore: 84,
          confidence: 'High',
          algorithm: 'Collaborative Filtering',
          reasons: [
            'Users with similar preferences chose this',
            'Rapidly appreciating area',
            'Modern amenities included',
            'High landlord rating'
          ],
          aiMetrics: {
            priceOptimality: 85,
            locationScore: 91,
            safetyRating: 89,
            transportScore: 88
          },
          predictedSatisfaction: 89,
          similarUserRating: 4.5
        }
      ];
      
      setRecommendations(mockRecommendations);
      setConfidenceScore(91);
      setLearningProgress(78);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 80) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAlgorithmIcon = (algorithm) => {
    switch (algorithm) {
      case 'Hybrid Filtering':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Content-Based':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'Collaborative Filtering':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Powered by machine learning</p>
          </div>
        </div>
        
        <select
          value={matchingAlgorithm}
          onChange={(e) => setMatchingAlgorithm(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="hybrid">Hybrid AI</option>
          <option value="collaborative">Social Matching</option>
          <option value="content">Content Analysis</option>
        </select>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className={`text-lg font-bold ${getConfidenceColor(confidenceScore)}`}>
              {confidenceScore}%
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">Confidence</p>
        </div>
        
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {learningProgress}%
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">Learning</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              4.8
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">Accuracy</p>
        </div>
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin"></div>
              <Brain className="absolute inset-0 m-auto w-6 h-6 text-purple-500 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            AI is analyzing {Math.floor(Math.random() * 1000) + 500} properties...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => onRecommendationSelect?.(rec)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h5>
                    <div className="flex items-center gap-1">
                      {getAlgorithmIcon(rec.algorithm)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{rec.algorithm}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-2">
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

              {/* AI Metrics */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${rec.aiMetrics.priceOptimality}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Price</span>
                </div>
                <div className="text-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${rec.aiMetrics.locationScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Location</span>
                </div>
                <div className="text-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${rec.aiMetrics.safetyRating}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Safety</span>
                </div>
                <div className="text-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                    <div 
                      className="bg-orange-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${rec.aiMetrics.transportScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Transport</span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Why this matches:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                  {rec.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rec.similarUserRating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rec.predictedSatisfaction}% satisfaction
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.confidence === 'Very High' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  rec.confidence === 'High' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {rec.confidence} Confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          AI Learning Insights
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Learning Progress</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{learningProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${learningProgress}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Response Time</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">1.2s</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Accuracy</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">94.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Help improve AI recommendations:
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.success('Thank you for your feedback!');
              setLearningProgress(prev => Math.min(100, prev + 2));
            }}
            className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
          >
            👍 Helpful
          </button>
          <button
            onClick={() => {
              toast.info('We\'ll improve our recommendations');
              generateRecommendations();
            }}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyRecommendationEngine;
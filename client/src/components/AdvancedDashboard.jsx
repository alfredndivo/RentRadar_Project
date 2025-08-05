import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useRealTimeData } from '../hooks/useRealTimeData';

const AdvancedDashboard = ({ userId, userType }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    engagement: 0,
    satisfaction: 0,
    efficiency: 0,
    growth: 0
  });
  const [predictions, setPredictions] = useState({
    nextWeekViews: 0,
    optimalPricing: 0,
    marketTrend: 'stable'
  });

  const { data: realtimeData, loading } = useRealTimeData(userId, 'analytics');

  useEffect(() => {
    generateAdvancedMetrics();
    generatePredictions();
  }, [timeRange, realtimeData]);

  const generateAdvancedMetrics = () => {
    // Simulate advanced analytics calculations
    setMetrics({
      engagement: Math.floor(Math.random() * 40) + 60, // 60-100%
      satisfaction: Math.floor(Math.random() * 30) + 70, // 70-100%
      efficiency: Math.floor(Math.random() * 35) + 65, // 65-100%
      growth: Math.floor(Math.random() * 50) + 50 // 50-100%
    });
  };

  const generatePredictions = () => {
    setPredictions({
      nextWeekViews: Math.floor(Math.random() * 100) + 50,
      optimalPricing: Math.floor(Math.random() * 10000) + 20000,
      marketTrend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)]
    });
  };

  // Advanced chart configurations
  const performanceRadarData = {
    labels: ['Engagement', 'Satisfaction', 'Efficiency', 'Growth', 'Quality', 'Speed'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          metrics.engagement,
          metrics.satisfaction,
          metrics.efficiency,
          metrics.growth,
          85, // Quality score
          92  // Speed score
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)'
      }
    ]
  };

  const predictiveAnalyticsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Predicted'],
    datasets: [
      {
        label: 'Actual Views',
        data: [45, 52, 48, 61, null],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Predicted Views',
        data: [null, null, null, 61, predictions.nextWeekViews],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  const heatmapData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Activity Heatmap',
        data: [12, 19, 15, 25, 22, 30, 18],
        backgroundColor: [
          'rgba(34, 197, 94, 0.3)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(34, 197, 94, 0.4)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(34, 197, 94, 1)',
          'rgba(34, 197, 94, 0.5)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Advanced Metrics Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered insights and predictions</p>
            </div>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </select>
        </div>

        {/* Performance Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h4>
            <div className="h-64">
              <Radar data={performanceRadarData} options={chartOptions} />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Predictive Analytics</h4>
            <div className="h-64">
              <Line data={predictiveAnalyticsData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Optimization suggestions</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Optimal Posting Time</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tuesday 2-4 PM gets 40% more views</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Price Optimization</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Consider reducing by 5% for faster booking</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Market Predictions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Next week forecast</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Expected Views</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{predictions.nextWeekViews}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Market Trend</span>
              <span className={`text-sm font-semibold capitalize ${
                predictions.marketTrend === 'rising' ? 'text-green-600 dark:text-green-400' :
                predictions.marketTrend === 'declining' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {predictions.marketTrend}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Boost your performance</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Optimize Images</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Improve loading speed</p>
            </button>
            <button className="w-full text-left p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Update Description</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Add trending keywords</p>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Heatmap</h4>
        <div className="h-64">
          <Bar data={heatmapData} options={chartOptions} />
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2s</p>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">Excellent</span>
              </div>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12.5%</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+2.3%</span>
              </div>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-purple-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94/100</p>
              <div className="flex items-center mt-1">
                <Brain className="w-3 h-3 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 dark:text-purple-400">Optimized</span>
              </div>
            </div>
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-yellow-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Market Position</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Top 15%</p>
              <div className="flex items-center mt-1">
                <Zap className="w-3 h-3 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Competitive</span>
              </div>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Predictions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Machine learning insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Next Week Views</span>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">+{predictions.nextWeekViews}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Based on current trends</p>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Optimal Price</span>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              KES {predictions.optimalPricing.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">AI-calculated sweet spot</p>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Market Trend</span>
            </div>
            <p className={`text-xl font-bold capitalize ${
              predictions.marketTrend === 'rising' ? 'text-green-600 dark:text-green-400' :
              predictions.marketTrend === 'declining' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              {predictions.marketTrend}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Market direction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
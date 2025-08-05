import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, Heart, MessageSquare, Calendar, Users, MapPin } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const PropertyAnalytics = ({ propertyId, isLandlord = false }) => {
  const [analytics, setAnalytics] = useState({
    views: [],
    saves: 0,
    messages: 0,
    bookings: 0,
    demographics: {},
    searchTerms: [],
    conversionRate: 0
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [propertyId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData = {
        views: [
          { date: '2024-01-01', count: 12 },
          { date: '2024-01-02', count: 18 },
          { date: '2024-01-03', count: 15 },
          { date: '2024-01-04', count: 22 },
          { date: '2024-01-05', count: 28 },
          { date: '2024-01-06', count: 35 },
          { date: '2024-01-07', count: 42 }
        ],
        saves: 15,
        messages: 8,
        bookings: 5,
        demographics: {
          ageGroups: { '18-25': 30, '26-35': 45, '36-45': 20, '46+': 5 },
          locations: { 'Nairobi': 60, 'Kiambu': 25, 'Machakos': 10, 'Other': 5 }
        },
        searchTerms: [
          { term: 'bedsitter westlands', count: 25 },
          { term: '1 bedroom nairobi', count: 18 },
          { term: 'affordable apartment', count: 12 }
        ],
        conversionRate: 12.5
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewsChartData = {
    labels: analytics.views.map(v => new Date(v.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Views',
        data: analytics.views.map(v => v.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const demographicsChartData = {
    labels: Object.keys(analytics.demographics.ageGroups || {}),
    datasets: [
      {
        data: Object.values(analytics.demographics.ageGroups || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Property Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Performance insights and metrics</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Views</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {analytics.views.reduce((sum, v) => sum + v.count, 0)}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Saves</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-300">{analytics.saves}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Messages</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">{analytics.messages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Bookings</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{analytics.bookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Views Over Time</h4>
          <div className="h-64">
            <Line data={viewsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Demographics */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Viewer Demographics</h4>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={demographicsChartData} />
          </div>
        </div>
      </div>

      {/* Search Terms */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Search Terms</h4>
        <div className="space-y-2">
          {analytics.searchTerms.map((term, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white">{term.term}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{term.count} searches</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.conversionRate}%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Views to messages ratio</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalytics;
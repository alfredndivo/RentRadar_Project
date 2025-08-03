import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Eye,
  Star,
  Clock,
  CheckCircle,
  Home
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const UserDashboardStats = ({ user }) => {
  const [stats, setStats] = useState({
    savedListings: 0,
    viewedListings: 0,
    sentMessages: 0,
    scheduledVisits: 0,
    completedVisits: 0,
    totalSpent: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const savedRes = await fetch('/api/user/saved-listings', { credentials: 'include' });
      const bookingsRes = await fetch('/api/bookings/my-bookings', { credentials: 'include' });
      
      if (!savedRes.ok || !bookingsRes.ok) {
        console.warn('Some dashboard data failed to load');
        // Continue with partial data instead of failing completely
      }
      
      const savedListings = savedRes.ok ? await savedRes.json() : [];
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

      const upcomingBookings = bookings.filter(b => 
        b.status === 'approved' && new Date(b.visitDate) > new Date()
      );

      setStats({
        savedListings: savedListings.length,
        viewedListings: 45, // Mock data - you can track this
        sentMessages: 12, // Mock data
        scheduledVisits: bookings.length,
        completedVisits: bookings.filter(b => b.status === 'completed').length,
        totalSpent: 0 // Calculate from rental history
      });

      setUpcomingVisits(upcomingBookings.slice(0, 3));

      // Mock recent activity
      setRecentActivity([
        { type: 'view', message: 'Viewed 3 new listings in Githurai', time: '2 hours ago', icon: Eye },
        { type: 'message', message: 'Messaged landlord about Bedsitter in Kasarani', time: '5 hours ago', icon: MessageSquare },
        { type: 'save', message: 'Saved 2 bedroom apartment in Westlands', time: '1 day ago', icon: Heart },
        { type: 'booking', message: 'Booked visit for Studio in Juja', time: '2 days ago', icon: Calendar }
      ]);

      // Mock top picks based on user preferences
      setTopPicks([
        { title: 'Modern Bedsitter in Kasarani', price: 8000, reason: 'Because you liked similar properties' },
        { title: '1 Bedroom in Githurai', price: 12000, reason: 'Popular in your area' },
        { title: 'Studio Apartment in Juja', price: 6500, reason: 'Within your budget range' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  // Chart data
  const viewsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Listings Viewed',
        data: [12, 19, 8, 15, 22, 18],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const categoryChartData = {
    labels: ['Bedsitter', '1 Bedroom', 'Studio', '2 Bedroom', 'Single Room'],
    datasets: [
      {
        label: 'Views by Category',
        data: [15, 12, 8, 6, 4],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 🏠</h2>
            <p className="opacity-90">Ready to find your perfect home today?</p>
          </div>
          <div className="hidden md:block">
            <Home className="w-16 h-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Saved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.savedListings}</p>
            </div>
            <Heart className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Viewed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.viewedListings}</p>
            </div>
            <Eye className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-purple-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Messages</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.sentMessages}</p>
            </div>
            <MessageSquare className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-yellow-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Visits</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.scheduledVisits}</p>
            </div>
            <Calendar className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Viewing Activity</h3>
          <Line data={viewsChartData} options={chartOptions} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Types Viewed</h3>
          <Bar data={categoryChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Picks & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI-Powered Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Picks For You</h3>
          </div>
          
          <div className="space-y-3">
            {topPicks.map((pick, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{pick.title}</p>
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    KES {pick.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{pick.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Visits</h3>
          </div>
          
          {upcomingVisits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">No upcoming visits</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Book a property visit to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <div key={visit._id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {visit.listing?.title}
                    </p>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(visit.visitDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {visit.visitTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Keep exploring to unlock achievements!</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">First Message</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Explorer Level 2</p>
          </div>
          
          <div className="text-center opacity-50">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">First Visit</p>
          </div>
          
          <div className="text-center opacity-50">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Home className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">House Hunter</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardStats;
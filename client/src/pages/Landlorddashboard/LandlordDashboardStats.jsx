import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Flag, 
  TrendingUp, 
  Users, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const LandlordDashboardStats = ({ user }) => {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    pendingBookings: 0,
    unreadMessages: 0,
    activeReports: 0,
    monthlyIncome: 0,
    trustScore: 85
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topListings, setTopListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [listingsRes, bookingsRes] = await Promise.all([
        fetch('/api/listings/my/listings', { credentials: 'include' }),
        fetch('/api/bookings/landlord-bookings', { credentials: 'include' })
      ]);

      const listings = await listingsRes.json();
      const bookings = await bookingsRes.json();

      // Calculate stats
      const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const activeListings = listings.filter(l => l.isActive && !l.isBanned).length;

      setStats({
        totalListings: listings.length,
        activeListings,
        totalViews,
        pendingBookings,
        unreadMessages: 0, // You can fetch this from messages API
        activeReports: 0, // You can fetch this from reports API
        monthlyIncome: 0, // Calculate from bookings/payments
        trustScore: 85 // Calculate based on reviews and reports
      });

      // Set recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));

      // Set top listings by views
      const sortedByViews = [...listings].sort((a, b) => (b.views || 0) - (a.views || 0));
      setTopListings(sortedByViews.slice(0, 3));

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

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {stats.activeListings} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-yellow-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBookings}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Awaiting response
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-purple-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Trust Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.trustScore}%</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">Verified</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Top Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={getImageUrl(booking.listing?.images?.[0])}
                    alt={booking.listing?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {booking.tenant?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {booking.listing?.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(booking.visitDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Listings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Listings</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          
          {topListings.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">No listings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topListings.map((listing, index) => (
                <div key={listing._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={getImageUrl(listing.images?.[0])}
                    alt={listing.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {listing.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Eye className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {listing.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      KES {listing.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Add Listing</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">View Bookings</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Messages</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <Flag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Reports</span>
          </button>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(stats.pendingBookings > 0 || stats.activeReports > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Action Required</h4>
              <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {stats.pendingBookings > 0 && (
                  <p>• You have {stats.pendingBookings} pending booking{stats.pendingBookings > 1 ? 's' : ''} awaiting response</p>
                )}
                {stats.activeReports > 0 && (
                  <p>• You have {stats.activeReports} active report{stats.activeReports > 1 ? 's' : ''} to address</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboardStats;
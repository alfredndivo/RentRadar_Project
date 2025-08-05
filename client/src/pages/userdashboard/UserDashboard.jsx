import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Heart, 
  MessageSquare, 
  Star, 
  Flag, 
  User, 
  LogOut,
  Bell,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import DarkModeToggle from '../../components/DarkModeToggle';
import BottomNavBar from '../../components/BottomNavBar';
import ProfileCompletionBar from '../../components/ProfileCompletionBar';
import NotificationBell from '../../components/NotificationBell';
import UserDashboardStats from './UserDashboardStats';
import UserListingsPage from './UserListingsPage';
import UserMessagesPage from './UserMessagesPage';
import UserSavedListings from './UserSavedListings';
import UserBookingsPage from './UserBookingsPage';
import UserReportsPage from './UserReportsPage';
import UserReviewsPage from './UserReviewsPage';
import UserProfilePage from './UserProfilePage';
import PropertyMap from '../../components/PropertyMap';
import SmartFilters from '../../components/SmartFilters';
import AIPropertyMatcher from '../../components/AIPropertyMatcher';
import PropertyRecommendationEngine from '../../components/PropertyRecommendationEngine';
import RealTimeUpdates from '../../components/RealTimeUpdates';
import PropertyRecommendations from '../../components/PropertyRecommendations';
import PropertyAlerts from '../../components/PropertyAlerts';
import { logoutUser } from '../../../api';

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [showMapView, setShowMapView] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user preferences for recommendations
    if (user) {
      setUserPreferences({
        maxBudget: 50000, // You can get this from user profile
        preferredLocations: ['Westlands', 'Kilimani', 'Lavington'],
        preferredTypes: ['1 Bedroom', '2 Bedroom', 'Studio']
      });
    }
    
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem(`search_history_${user._id}`) || '[]');
    setSearchHistory(history);
  }, [user]);

  const handleLogout = async () => {
    try {
      // Disconnect socket before logout
      const socketService = (await import('../../utils/socket')).default;
      socketService.disconnect();
      
      await logoutUser();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/auth');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/user/dashboard', exact: true },
    { name: 'Browse Listings', icon: <Search className="w-5 h-5" />, path: '/user/dashboard/browse' },
    { name: 'Saved Listings', icon: <Heart className="w-5 h-5" />, path: '/user/dashboard/saved' },
    { name: 'My Bookings', icon: <Calendar className="w-5 h-5" />, path: '/user/dashboard/bookings' },
    { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/user/dashboard/messages' },
    { name: 'My Reviews', icon: <Star className="w-5 h-5" />, path: '/user/dashboard/reviews' },
    { name: 'My Reports', icon: <Flag className="w-5 h-5" />, path: '/user/dashboard/reports' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/user/dashboard/profile' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div>
      <DarkModeToggle />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Mobile Header */}
        <div className="lg:hidden bg-green-800 dark:bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-green-300" />
            <h1 className="text-xl font-bold">RentRadar</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-green-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-green-100 dark:bg-gray-800 text-gray-800 dark:text-white transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-6 h-full overflow-y-auto">
              {/* Logo */}
              <div className="hidden lg:flex items-center gap-3 mb-8">
                <img 
                  src="/rentradar.png.png" 
                  alt="RentRadar" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-green-500 rounded-full items-center justify-center hidden">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-green-800 dark:text-white">RentRadar</h1>
              </div>

              {/* User Info */}
              {user && (
                <>
                  <ProfileCompletionBar user={user} userType="user" />
                  <div className="mb-8 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-sm border border-green-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Tenant</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path, item.exact)
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-green-200 dark:hover:bg-gray-700 hover:text-green-800 dark:hover:text-white'
                      }
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-8 flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-0 min-h-screen pb-20 md:pb-0">
            <div className="p-6">
              {/* Mobile Notification Bell */}
              <div className="md:hidden flex justify-end mb-4">
                <NotificationBell userId={user?._id || user?.id} userType="User" />
              </div>
              
              <Routes>
                <Route path="/" element={
                  <div className="space-y-6">
                    <UserDashboardStats user={user} />
                    <RealTimeUpdates userId={user?._id || user?.id} userType="User" />
                    <AIPropertyMatcher 
                      userId={user?._id || user?.id}
                      userPreferences={userPreferences}
                      onRecommendationSelect={(rec) => {
                        toast.success(`Showing properties like: ${rec.title}`);
                        navigate('/user/dashboard/browse');
                      }}
                    />
                    <PropertyRecommendations 
                      userPreferences={userPreferences} 
                      currentLocation={user?.location}
                    />
                    <PropertyRecommendationEngine
                      userId={user?._id || user?.id}
                      userPreferences={userPreferences}
                      onRecommendationSelect={(rec) => {
                        navigate('/user/dashboard/browse');
                      }}
                    />
                    <PropertyAlerts userId={user?._id || user?.id} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Browse Properties</h2>
                            <button
                              onClick={() => setShowMapView(!showMapView)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              {showMapView ? 'List View' : 'Map View'}
                            </button>
                          </div>
                          {showMapView ? (
                            <div className="h-96">
                              <PropertyMap 
                                listings={[]} 
                                onPropertySelect={(property) => {
                                  toast.success(`Selected: ${property.title}`);
                                }}
                                className="h-full"
                              />
                            </div>
                          ) : (
                            <UserListingsPage />
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <SmartFilters 
                          onFiltersChange={(filters) => {
                            // Apply smart filters to listings
                            console.log('Smart filters applied:', filters);
                          }}
                          userPreferences={userPreferences}
                          searchHistory={searchHistory}
                        />
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/browse" element={<UserListingsPage />} />
                <Route path="/saved" element={<UserSavedListings />} />
                <Route path="/bookings" element={<UserBookingsPage />} />
                <Route path="/messages" element={<UserMessagesPage />} />
                <Route path="/reviews" element={<UserReviewsPage />} />
                <Route path="/reports" element={<UserReportsPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
              </Routes>
            </div>
          </main>
        </div>
        
        <BottomNavBar userType="user" />
      </div>
    </div>
  );
};

export default UserDashboard;
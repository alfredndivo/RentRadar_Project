import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Flag, 
  Users, 
  Building, 
  LogOut,
  BarChart3,
  MessageSquare,
  Shield,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import DarkModeToggle from '../../components/DarkModeToggle';
import NotificationBell from '../../components/NotificationBell';
import { logoutUser } from '../../../api';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingReports: 0,
    activeLandlords: 0,
    verifiedLandlords: 0,
    bannedUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      
      setStats({
        totalUsers: data.stats?.users || 0,
        totalListings: data.stats?.listings || 0,
        pendingReports: data.stats?.reports || 0,
        activeLandlords: 89, // Mock data
        verifiedLandlords: 67, // Mock data
        bannedUsers: 5 // Mock data
      });

      // Mock recent activity
      setRecentActivity([
        { type: 'user', message: 'New user registered', time: '2 minutes ago', icon: Users },
        { type: 'listing', message: 'New listing posted', time: '5 minutes ago', icon: Building },
        { type: 'report', message: 'Report submitted', time: '10 minutes ago', icon: Flag },
        { type: 'message', message: 'Admin warning sent', time: '15 minutes ago', icon: MessageSquare }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard', exact: true },
    { name: 'Reports', icon: <Flag className="w-5 h-5" />, path: '/admin/reports' },
    { name: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/admin/analytics' },
    { name: 'Moderation', icon: <Shield className="w-5 h-5" />, path: '/admin/moderation' },
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Mobile Header */}
        <div className="lg:hidden bg-blue-800 dark:bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-blue-300" />
            <h1 className="text-xl font-bold">RentRadar Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transform transition-transform duration-300 ease-in-out
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
                <div className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center hidden">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-blue-800 dark:text-white">RentRadar</h1>
                </div>
                <NotificationBell userId={user?._id || user?.id} userType="Admin" />
              </div>

              {/* Admin Info */}
              {user && (
                <div className="mb-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-2xl shadow-sm border border-blue-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{user.username || user.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Administrator</p>
                    </div>
                  </div>
                </div>
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
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white'
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
          <main className="flex-1 lg:ml-0 min-h-screen">
            <div className="p-6">
              {/* Dashboard Overview */}
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300">Manage your RentRadar platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% this month</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Listings</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% this month</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-yellow-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Reports</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReports}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Needs attention</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                        <Flag className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-purple-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Landlords</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeLandlords}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{stats.verifiedLandlords} verified</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      const getActivityColor = (type) => {
                        switch (type) {
                          case 'user': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
                          case 'listing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                          case 'report': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                          case 'message': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
                          default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                        }
                      };
                      
                      return (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <Icon className="w-4 h-4" />
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

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => navigate('/admin/reports')}
                      className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">Handle Reports</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Manage Users</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/admin/analytics')}
                      className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">View Analytics</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/admin/moderation')}
                      className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Moderation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
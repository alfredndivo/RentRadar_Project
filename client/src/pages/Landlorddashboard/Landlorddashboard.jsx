import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  LogOut, 
  Mail, 
  FileText, 
  Flag,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import DarkModeToggle from '../../components/DarkModeToggle';
import ProfileCompletionBar from '../../components/ProfileCompletionBar';
import NotificationBell from '../../components/NotificationBell';
import LandlordDashboardStats from './LandlordDashboardStats';
import BottomNavBar from '../../components/BottomNavBar';
import { logoutUser } from '../../../api';

const LandlordDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

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
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/landlord/dashboard', exact: true },
    { name: 'My Listings', icon: <Building className="w-5 h-5" />, path: '/landlord/listings' },
    { name: 'Bookings', icon: <Calendar className="w-5 h-5" />, path: '/landlord/bookings' },
    { name: 'Messages', icon: <Mail className="w-5 h-5" />, path: '/landlord/messages' },
    { name: 'Reports', icon: <Flag className="w-5 h-5" />, path: '/landlord/reports' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/landlord/profile' },
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
            <h1 className="text-xl font-bold">RentRadar Landlord</h1>
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
                <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-blue-800 dark:text-white">RentRadar</h1>
                </div>
                <NotificationBell userId={user?._id || user?.id} userType="Landlord" />
              </div>

              {/* Landlord Info */}
              {user && (
                <>
                  <ProfileCompletionBar user={user} userType="landlord" />
                  <div className="mb-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-2xl shadow-sm border border-blue-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Landlord</p>
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
            <div className="p-6 pb-20 md:pb-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-blue-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">Manage your properties and tenant interactions</p>
                  </div>
                  <div className="md:hidden">
                    <NotificationBell userId={user?._id || user?.id} userType="Landlord" />
                  </div>
                </div>
              </div>

              {/* Dashboard Stats */}
              <LandlordDashboardStats user={user} />
            </div>
          </main>
        </div>
        
        <BottomNavBar userType="landlord" />
      </div>
    </div>
  );
};

export default LandlordDashboard;
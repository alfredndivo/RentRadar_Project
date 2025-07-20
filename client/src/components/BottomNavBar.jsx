import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';

const BottomNavBar = ({ userType = 'user' }) => {
  const location = useLocation();

  const getNavItems = () => {
    if (userType === 'landlord') {
      return [
        { name: 'Dashboard', icon: Home, path: '/landlord/dashboard' },
        { name: 'Listings', icon: Search, path: '/landlord/listings' },
        { name: 'Messages', icon: MessageSquare, path: '/landlord/messages' },
        { name: 'Reports', icon: Heart, path: '/landlord/reports' },
        { name: 'Profile', icon: User, path: '/landlord/profile' },
      ];
    } else {
      return [
        { name: 'Browse', icon: Search, path: '/user/dashboard' },
        { name: 'Saved', icon: Heart, path: '/user/dashboard/saved' },
        { name: 'Messages', icon: MessageSquare, path: '/user/dashboard/messages' },
        { name: 'Reports', icon: Home, path: '/user/dashboard/reports' },
        { name: 'Profile', icon: User, path: '/user/dashboard/profile' },
      ];
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    if (path === '/user/dashboard' && location.pathname === '/user/dashboard') return true;
    if (path !== '/user/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
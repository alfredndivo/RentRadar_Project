import React, { useState, useEffect } from 'react';
import { Zap, Bell, TrendingUp, Users, Eye, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import socketService from '../utils/socket';

const RealTimeUpdates = ({ userId, userType = 'User' }) => {
  const [liveStats, setLiveStats] = useState({
    activeUsers: 0,
    newListings: 0,
    recentActivity: []
  });
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [showLiveIndicator, setShowLiveIndicator] = useState(true);

  useEffect(() => {
    // Connect to real-time updates
    if (socketService.socket) {
      // Listen for live stats updates
      socketService.socket.on('liveStats', (stats) => {
        setLiveStats(stats);
      });

      // Listen for real-time activity
      socketService.socket.on('realtimeActivity', (activity) => {
        setRecentUpdates(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10
        
        // Show toast for relevant updates
        if (activity.type === 'new_listing' && userType === 'User') {
          toast.info(`New property: ${activity.title}`, {
            action: {
              label: 'View',
              onClick: () => window.location.href = '/user/dashboard/browse'
            }
          });
        }
      });

      // Listen for user online/offline status
      socketService.socket.on('userStatusUpdate', ({ userId: statusUserId, isOnline }) => {
        setLiveStats(prev => ({
          ...prev,
          activeUsers: isOnline ? prev.activeUsers + 1 : Math.max(0, prev.activeUsers - 1)
        }));
      });

      // Request initial stats
      socketService.socket.emit('requestLiveStats');
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('liveStats');
        socketService.socket.off('realtimeActivity');
        socketService.socket.off('userStatusUpdate');
      }
    };
  }, [userType]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_listing':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'new_booking':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'user_joined':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'new_listing':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'new_message':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'new_booking':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'user_joined':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Live Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Real-time platform activity</p>
          </div>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${showLiveIndicator ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {showLiveIndicator ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {liveStats.activeUsers}
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">Online Now</p>
        </div>
        
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {liveStats.newListings}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">New Today</p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
              +12%
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">Growth</p>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          Live Activity
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentUpdates.length === 0 ? (
            <div className="text-center py-4">
              <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Waiting for live updates...</p>
            </div>
          ) : (
            recentUpdates.map((update, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getActivityColor(update.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {update.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimeAgo(update.timestamp)}
                  </p>
                </div>
                {update.action && (
                  <button
                    onClick={() => update.action()}
                    className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    View
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Market Pulse */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Market Pulse
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-lg font-bold text-gray-900 dark:text-white">2.3k</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Active Searches</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-lg font-bold text-gray-900 dark:text-white">89%</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Response Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeUpdates;
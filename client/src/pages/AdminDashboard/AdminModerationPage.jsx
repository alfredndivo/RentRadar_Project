import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Ban, 
  MessageSquare, 
  Send,
  Users,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  sendWarningMessage, 
  banListing, 
  forceLogoutUser, 
  sendGlobalNotification,
  getAdminUsers,
  getAllListings
} from '../../../api';
import DarkModeToggle from '../../components/DarkModeToggle';

const AdminModerationPage = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [banReason, setBanReason] = useState('');
  const [globalNotification, setGlobalNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'medium'
  });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, listingsRes] = await Promise.all([
        getAdminUsers(),
        getAllListings()
      ]);
      
      setUsers(usersRes.data || []);
      setListings(listingsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage.trim()) return;

    setActionLoading(true);
    try {
      await sendWarningMessage({
        landlordId: selectedUser._id,
        message: warningMessage,
        severity: 'high'
      });
      
      toast.success('Warning sent successfully');
      setShowWarningModal(false);
      setWarningMessage('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending warning:', error);
      toast.error('Failed to send warning');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanListing = async () => {
    if (!selectedListing || !banReason.trim()) return;

    setActionLoading(true);
    try {
      await banListing(selectedListing._id, { reason: banReason });
      
      // Update local state
      setListings(prev => prev.map(listing => 
        listing._id === selectedListing._id 
          ? { ...listing, isBanned: true, banReason }
          : listing
      ));
      
      toast.success('Listing banned successfully');
      setShowBanModal(false);
      setBanReason('');
      setSelectedListing(null);
    } catch (error) {
      console.error('Error banning listing:', error);
      toast.error('Failed to ban listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceLogout = async (userId) => {
    if (!window.confirm('Are you sure you want to force logout this user?')) return;

    try {
      await forceLogoutUser(userId, { reason: 'Forced logout by admin' });
      toast.success('User logged out successfully');
    } catch (error) {
      console.error('Error forcing logout:', error);
      toast.error('Failed to force logout');
    }
  };

  const handleSendGlobalNotification = async () => {
    if (!globalNotification.title.trim() || !globalNotification.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setActionLoading(true);
    try {
      await sendGlobalNotification(globalNotification);
      
      toast.success('Global notification sent successfully');
      setShowGlobalModal(false);
      setGlobalNotification({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error sending global notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DarkModeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DarkModeToggle />
      <div className="p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-blue-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderation Panel</h1>
              <p className="text-gray-600 dark:text-gray-300">Monitor and moderate platform activity</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowGlobalModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Send Global Alert
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listings.filter(l => l.isActive && !l.isBanned).length}
                </p>
              </div>
              <Building className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.isBanned).length}
                </p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-yellow-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Banned Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listings.filter(l => l.isBanned).length}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Recent Users & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-blue-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name || 'No name'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role === 'landlord' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowWarningModal(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleForceLogout(user._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Listings</h3>
            <div className="space-y-3">
              {listings.slice(0, 5).map((listing) => (
                <div key={listing._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(listing.images?.[0])}
                      alt={listing.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{listing.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{listing.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/user/dashboard/browse`, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!listing.isBanned && (
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowBanModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Modal */}
        {showWarningModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Send Warning to {selectedUser.name}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Warning Message
                  </label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter warning message..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowWarningModal(false);
                      setWarningMessage('');
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendWarning}
                    disabled={actionLoading || !warningMessage.trim()}
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Sending...' : 'Send Warning'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ban Listing Modal */}
        {showBanModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ban Listing: {selectedListing.title}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ban Reason
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for banning this listing..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBanModal(false);
                      setBanReason('');
                      setSelectedListing(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBanListing}
                    disabled={actionLoading || !banReason.trim()}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Banning...' : 'Ban Listing'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Notification Modal */}
        {showGlobalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Send Global Notification
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={globalNotification.title}
                      onChange={(e) => setGlobalNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Notification title..."
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={globalNotification.message}
                      onChange={(e) => setGlobalNotification(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      placeholder="Notification message..."
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={globalNotification.type}
                        onChange={(e) => setGlobalNotification(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="system">System</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="update">Update</option>
                        <option value="warning">Warning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={globalNotification.priority}
                        onChange={(e) => setGlobalNotification(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowGlobalModal(false);
                      setGlobalNotification({
                        title: '',
                        message: '',
                        type: 'system',
                        priority: 'medium'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendGlobalNotification}
                    disabled={actionLoading || !globalNotification.title.trim() || !globalNotification.message.trim()}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Sending...' : 'Send Notification'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;
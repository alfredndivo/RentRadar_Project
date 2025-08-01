import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, MapPin, DollarSign, Home, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PropertyAlerts = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    location: '',
    maxPrice: '',
    minPrice: '',
    houseType: '',
    minBedrooms: '',
    maxBedrooms: ''
  });

  const houseTypes = [
    'Single Room', 'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom',
    'Maisonette', 'Bungalow', 'Apartment', 'Penthouse', 'Hostel Room',
    'Servant Quarter', 'Shared Room', 'Townhouse', 'Villa'
  ];

  useEffect(() => {
    loadAlerts();
  }, [userId]);

  const loadAlerts = () => {
    // Load from localStorage for now (you can implement API later)
    const savedAlerts = localStorage.getItem(`property_alerts_${userId}`);
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  };

  const saveAlerts = (alertsToSave) => {
    localStorage.setItem(`property_alerts_${userId}`, JSON.stringify(alertsToSave));
    setAlerts(alertsToSave);
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    
    if (!newAlert.name.trim()) {
      toast.error('Please enter an alert name');
      return;
    }

    const alert = {
      id: Date.now().toString(),
      ...newAlert,
      createdAt: new Date().toISOString(),
      isActive: true,
      matchCount: 0
    };

    const updatedAlerts = [...alerts, alert];
    saveAlerts(updatedAlerts);
    
    setShowCreateModal(false);
    setNewAlert({
      name: '',
      location: '',
      maxPrice: '',
      minPrice: '',
      houseType: '',
      minBedrooms: '',
      maxBedrooms: ''
    });
    
    toast.success('Property alert created successfully');
  };

  const deleteAlert = (alertId) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    saveAlerts(updatedAlerts);
    toast.success('Alert deleted');
  };

  const toggleAlert = (alertId) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(updatedAlerts);
    toast.success('Alert updated');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Property Alerts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Get notified when new properties match your criteria</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">No property alerts set up</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{alert.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {alert.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  {alert.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.location}
                    </div>
                  )}
                  {(alert.minPrice || alert.maxPrice) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {alert.minPrice && `${alert.minPrice}+`}
                      {alert.minPrice && alert.maxPrice && ' - '}
                      {alert.maxPrice && `${alert.maxPrice}`}
                    </div>
                  )}
                  {alert.houseType && (
                    <div className="flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {alert.houseType}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    alert.isActive
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                  }`}
                >
                  {alert.isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Property Alert</h3>
              
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Name
                  </label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Affordable Westlands Apartments"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newAlert.location}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Westlands, Nairobi"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Price (KES)
                    </label>
                    <input
                      type="number"
                      value={newAlert.minPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, minPrice: e.target.value }))}
                      placeholder="10000"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Price (KES)
                    </label>
                    <input
                      type="number"
                      value={newAlert.maxPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, maxPrice: e.target.value }))}
                      placeholder="50000"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <select
                    value={newAlert.houseType}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, houseType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Type</option>
                    {houseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Create Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAlerts;
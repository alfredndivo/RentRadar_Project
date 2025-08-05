// Offline functionality manager
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    this.cachedData = new Map();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      this.showOnlineToast();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineToast();
    });
  }

  showOnlineToast() {
    const { toast } = require('sonner');
    toast.success('Back online! Syncing data...', {
      duration: 3000
    });
  }

  showOfflineToast() {
    const { toast } = require('sonner');
    toast.warning('You\'re offline. Some features may be limited.', {
      duration: 5000
    });
  }

  // Queue actions for when back online
  queueAction(action) {
    this.offlineQueue.push({
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    
    localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
  }

  // Process queued actions when back online
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const { toast } = require('sonner');
    toast.info(`Processing ${this.offlineQueue.length} queued actions...`);

    for (const action of this.offlineQueue) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }

    this.offlineQueue = [];
    localStorage.removeItem('offlineQueue');
    toast.success('All actions synced successfully!');
  }

  async executeAction(action) {
    const { default: API } = await import('../../api');
    
    switch (action.type) {
      case 'SAVE_LISTING':
        return API.post(`/user/save-listing/${action.data.listingId}`);
      case 'SEND_MESSAGE':
        return API.post('/chats/send', action.data);
      case 'CREATE_BOOKING':
        return API.post('/bookings', action.data);
      case 'SUBMIT_REVIEW':
        return API.post('/reviews', action.data);
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // Cache data for offline access
  cacheData(key, data, ttl = 3600000) { // 1 hour default
    this.cachedData.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  getCachedData(key) {
    const cached = this.cachedData.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cachedData.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Save critical data to localStorage
  saveCriticalData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  getCriticalData(key) {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  // Check if action can be performed offline
  canPerformOffline(actionType) {
    const offlineActions = [
      'VIEW_LISTING',
      'BROWSE_SAVED',
      'VIEW_PROFILE',
      'VIEW_BOOKINGS'
    ];
    
    return offlineActions.includes(actionType);
  }
}

export default new OfflineManager();
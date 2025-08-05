import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkStatus: 'online',
    apiResponseTime: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: Math.round(entry.loadEventEnd - entry.loadEventStart)
          }));
        }
        
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: Math.round(entry.duration)
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor memory usage
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      };
      
      const memoryInterval = setInterval(updateMemory, 5000);
      return () => clearInterval(memoryInterval);
    }

    // Monitor network status
    const updateNetworkStatus = () => {
      setMetrics(prev => ({
        ...prev,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      }));
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      observer.disconnect();
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.ok) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceStatus = () => {
    const issues = [];
    
    if (metrics.loadTime > 3000) issues.push('Slow page load');
    if (metrics.memoryUsage > 100) issues.push('High memory usage');
    if (metrics.networkStatus === 'offline') issues.push('No internet connection');
    if (metrics.apiResponseTime > 2000) issues.push('Slow API responses');
    
    return issues;
  };

  const performanceIssues = getPerformanceStatus();

  // Only show if there are performance issues or in development
  if (performanceIssues.length === 0 && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          performanceIssues.length > 0 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-green-500 text-white'
        }`}
      >
        {metrics.networkStatus === 'offline' ? (
          <WifiOff className="w-5 h-5" />
        ) : performanceIssues.length > 0 ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Activity className="w-5 h-5" />
        )}
      </button>

      {showDetails && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-64">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Monitor
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Load Time</span>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.loadTime, { good: 1000, ok: 3000 })}`}>
                {metrics.loadTime}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Memory Usage</span>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.memoryUsage, { good: 50, ok: 100 })}`}>
                {metrics.memoryUsage}MB
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Network</span>
              <div className="flex items-center gap-1">
                {metrics.networkStatus === 'online' ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-semibold ${
                  metrics.networkStatus === 'online' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metrics.networkStatus}
                </span>
              </div>
            </div>
          </div>

          {performanceIssues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Issues Detected:</h5>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {performanceIssues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
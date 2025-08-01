import React from 'react';
import { Home } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-green-200 dark:border-green-800 border-t-green-500 dark:border-t-green-400 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Home className="w-4 h-4 text-green-500 dark:text-green-400" />
        </div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
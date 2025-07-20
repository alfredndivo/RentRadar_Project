import React from 'react';

export const ListingSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    </div>
  </div>
);

export const MessageSkeleton = () => (
  <div className="flex items-center gap-3 p-4 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-6 mb-6">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);
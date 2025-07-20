import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ProfileCompletionBar = ({ user, userType = 'user' }) => {
  const getCompletionData = () => {
    if (userType === 'landlord') {
      const fields = [
        { key: 'name', label: 'Name', completed: !!user?.name },
        { key: 'email', label: 'Email', completed: !!user?.email },
        { key: 'phone', label: 'Phone', completed: !!user?.phone },
        { key: 'idNumber', label: 'ID Number', completed: !!user?.idNumber },
        { key: 'location', label: 'Location', completed: !!user?.location },
        { key: 'nationalIdPhoto', label: 'ID Photo', completed: !!user?.nationalIdPhoto },
      ];
      return fields;
    } else {
      const fields = [
        { key: 'name', label: 'Name', completed: !!user?.name },
        { key: 'email', label: 'Email', completed: !!user?.email },
        { key: 'phone', label: 'Phone', completed: !!user?.phone },
        { key: 'photo', label: 'Profile Photo', completed: !!user?.photo },
        { key: 'preferences', label: 'Preferences', completed: !!user?.preferences },
      ];
      return fields;
    }
  };

  const fields = getCompletionData();
  const completedFields = fields.filter(field => field.completed);
  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);

  if (completionPercentage === 100) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 mb-6 border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
          Profile Completion
        </h3>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          {completionPercentage}%
        </span>
      </div>
      
      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-2">
            {field.completed ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Circle className="w-3 h-3 text-gray-400" />
            )}
            <span className={field.completed ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletionBar;
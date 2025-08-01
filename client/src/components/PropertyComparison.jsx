import React, { useState } from 'react';
import { X, Plus, Minus, MapPin, Bed, Bath, DollarSign, Eye, Calendar } from 'lucide-react';

const PropertyComparison = ({ properties, onClose, onRemove }) => {
  const [selectedProperties, setSelectedProperties] = useState(properties.slice(0, 3));

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const removeProperty = (propertyId) => {
    setSelectedProperties(prev => prev.filter(p => p._id !== propertyId));
    onRemove?.(propertyId);
  };

  const comparisonRows = [
    { key: 'price', label: 'Monthly Rent', icon: DollarSign, format: (value) => `KES ${value?.toLocaleString()}` },
    { key: 'location', label: 'Location', icon: MapPin, format: (value) => value },
    { key: 'houseType', label: 'Property Type', icon: Eye, format: (value) => value },
    { key: 'bedrooms', label: 'Bedrooms', icon: Bed, format: (value) => value || 'N/A' },
    { key: 'bathrooms', label: 'Bathrooms', icon: Bath, format: (value) => value || 'N/A' },
    { key: 'views', label: 'Views', icon: Eye, format: (value) => value || 0 },
    { key: 'createdAt', label: 'Posted', icon: Calendar, format: (value) => new Date(value).toLocaleDateString() }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Property Comparison</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {selectedProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No properties to compare</h3>
              <p className="text-gray-600 dark:text-gray-300">Add properties to start comparing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Feature</th>
                    {selectedProperties.map((property) => (
                      <th key={property._id} className="text-center p-4 min-w-64">
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={getImageUrl(property.images?.[0])}
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeProperty(property._id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {property.title}
                            </h4>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.key} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{row.label}</span>
                          </div>
                        </td>
                        {selectedProperties.map((property) => (
                          <td key={property._id} className="p-4 text-center">
                            <span className="text-gray-900 dark:text-white">
                              {row.format(property[row.key])}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;
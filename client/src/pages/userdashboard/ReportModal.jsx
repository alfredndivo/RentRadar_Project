import React, { useState } from 'react';
import { X, Flag, Search } from 'lucide-react';
import { toast } from 'sonner';
import { submitReport, getAllListings, getAdminUsers } from '../../../api';

const ReportModal = ({ isOpen, onClose, onSubmit, targetId, targetType }) => {
  const [formData, setFormData] = useState({
    targetType: targetType || 'listing',
    targetId: targetId || '',
    reason: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(!targetId);

  const reasons = [
    'Fraudulent',
    'Scam',
    'Unavailable',
    'Rude Behavior',
    'Duplicate Listing',
    'Inappropriate Content',
    'Misleading Information',
    'Other'
  ];

  const searchTargets = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      if (formData.targetType === 'listing') {
        const response = await getAllListings();
        const filtered = response.data.filter(listing =>
          listing.title.toLowerCase().includes(term.toLowerCase()) ||
          listing.location.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 5));
      } else {
        // For user reports, you might want to implement a search endpoint
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching targets:', error);
    }
  };

  const selectTarget = (target) => {
    setFormData(prev => ({ ...prev, targetId: target._id }));
    setSearchTerm(target.title || target.name);
    setSearchResults([]);
    setShowSearch(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.details.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.targetId) {
      toast.error('Please select a target to report');
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await submitReport(formData);
        toast.success('Report submitted successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'targetType') {
      setFormData(prev => ({ ...prev, targetId: '' }));
      setSearchTerm('');
      setSearchResults([]);
      setShowSearch(!targetId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Submit Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="listing">Property Listing</option>
              <option value="user">User/Landlord</option>
            </select>
          </div>

          {/* Target Search/Selection */}
          {showSearch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search {formData.targetType === 'listing' ? 'Property' : 'User'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchTargets(e.target.value);
                  }}
                  placeholder={`Search for ${formData.targetType}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result._id}
                        type="button"
                        onClick={() => selectTarget(result)}
                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{result.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{result.location}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.targetId && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Target selected
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Report *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a reason</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Details *
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              placeholder="Please provide specific details about the issue..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific and provide as much detail as possible
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <strong>Note:</strong> False reports may result in account restrictions. 
              Please ensure your report is accurate and justified.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
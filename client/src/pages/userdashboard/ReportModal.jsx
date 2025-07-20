import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { toast } from 'sonner';

const ReportModal = ({ isOpen, onClose, onSubmit, targetId, targetType }) => {
  const [formData, setFormData] = useState({
    targetType: targetType || 'listing',
    targetId: targetId || '',
    reason: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.details.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Submit Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
            >
              <option value="listing">Property Listing</option>
              <option value="user">User/Landlord</option>
            </select>
          </div>

          {/* Target ID (if not provided) */}
          {!targetId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.targetType === 'listing' ? 'Listing ID' : 'User ID'}
              </label>
              <input
                type="text"
                name="targetId"
                value={formData.targetId}
                onChange={handleChange}
                placeholder={`Enter ${formData.targetType} ID`}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Report *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details *
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              placeholder="Please provide specific details about the issue..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific and provide as much detail as possible
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> False reports may result in account restrictions. 
              Please ensure your report is accurate and justified.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
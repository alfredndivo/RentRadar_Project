import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Flag, Calendar, AlertTriangle, CheckCircle, X, ArrowLeft, Eye, MessageSquare } from "lucide-react";
import { toast } from 'sonner';
import { getAllReportsForAdmin } from '../../../api';
import DarkModeToggle from '../../components/DarkModeToggle';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingReport, setUpdatingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({ status: '', adminResponse: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      const res = await getAllReportsForAdmin();
      console.log('Admin reports response:', res.data);
      setReports(res.data || []);
    } catch (error) {
      console.error("Error fetching reports", error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, status, adminResponse = '') => {
    setUpdatingReport(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status, adminResponse })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update report');
      }

      const result = await response.json();
      
      // Update local state
      setReports(prev => prev.map(report => 
        report._id === reportId 
          ? { ...report, status, adminResponse }
          : report
      ));

      toast.success(`Report ${status} successfully`);
      setShowResponseModal(false);
      setSelectedReport(null);
      setResponseData({ status: '', adminResponse: '' });
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error(error.message || 'Failed to update report');
    } finally {
      setUpdatingReport(null);
    }
  };

  const handleQuickAction = (report, status) => {
    setSelectedReport(report);
    setResponseData({ status, adminResponse: '' });
    setShowResponseModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'Fraudulent':
      case 'Scam':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Flag className="w-5 h-5 text-orange-500" />;
    }
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All User Reports</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage and review user-submitted reports</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending: {reports.filter(r => !r.status || r.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Resolved: {reports.filter(r => r.status === 'resolved').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Total: {reports.length}</span>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-blue-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No reports submitted yet</h3>
            <p className="text-gray-600 dark:text-gray-300">Reports will appear here when users submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-gray-800 shadow-md border-l-4 border-red-500 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getReasonIcon(report.reason)}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{report.reason}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Report #{report._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status || 'pending')}`}>
                    {(report.status || 'pending').charAt(0).toUpperCase() + (report.status || 'pending').slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300">{report.details}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Reporter: {report.reportedBy?.name || report.reportedBy?.username || "Unknown"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Target: {report.targetType}</span>
                  </div>
                </div>

                {report.targetType === 'listing' && report.listing && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                      Related Listing: <span className="font-semibold">{report.listing.title || "Listing Info"}</span>
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Location: {report.listing.location}
                    </p>
                  </div>
                )}

                {report.targetType === 'user' && (report.landlord || report.user) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                      Against User: <span className="font-semibold">{report.landlord?.name || report.user?.name || "Unknown"}</span>
                    </p>
                  </div>
                )}

                {report.adminResponse && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">Admin Response:</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{report.adminResponse}</p>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleQuickAction(report, 'resolved')}
                    disabled={updatingReport === report._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {updatingReport === report._id ? 'Updating...' : 'Mark Resolved'}
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction(report, 'investigating')}
                    disabled={updatingReport === report._id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    {updatingReport === report._id ? 'Updating...' : 'Investigate'}
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction(report, 'dismissed')}
                    disabled={updatingReport === report._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {updatingReport === report._id ? 'Updating...' : 'Dismiss'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Update Report Status
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Report: <strong>{selectedReport.reason}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    New Status: <strong className="capitalize">{responseData.status}</strong>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Response (Optional)
                  </label>
                  <textarea
                    value={responseData.adminResponse}
                    onChange={(e) => setResponseData(prev => ({ ...prev, adminResponse: e.target.value }))}
                    rows={3}
                    placeholder="Add a response message for the reporter..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResponseModal(false);
                      setSelectedReport(null);
                      setResponseData({ status: '', adminResponse: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, responseData.status, responseData.adminResponse)}
                    disabled={updatingReport === selectedReport._id}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {updatingReport === selectedReport._id ? 'Updating...' : 'Update Status'}
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

export default AdminReportsPage;
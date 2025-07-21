import React, { useEffect, useState } from "react";
import { Flag, Calendar, AlertTriangle, CheckCircle, X, ArrowLeft, Plus } from "lucide-react";
import { toast } from 'sonner';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getUserReports, submitReport } from '../../../api';
import DarkModeToggle from '../../components/DarkModeToggle';
import ReportModal from '../userdashboard/ReportModal';

const LandlordReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useOutletContext();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getUserReports();
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (reportData) => {
    try {
      await submitReport(reportData);
      toast.success('Report submitted successfully');
      fetchReports();
      setShowReportModal(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DarkModeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DarkModeToggle />
      <div className="p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/landlord/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reports</h1>
                <p className="text-gray-600 dark:text-gray-300">Track your submitted reports and their status</p>
              </div>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Submit Report
            </button>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-green-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No reports submitted</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't submitted any reports yet</p>
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-green-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getReasonIcon(report.reason)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.reason}</h3>
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

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span>Target: {report.targetType}</span>
                    </div>
                  </div>
                  {report.adminResponse && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Response available</span>
                  )}
                </div>

                {report.adminResponse && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-1">Admin Response:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{report.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleSubmitReport}
          />
        )}
      </div>
    </div>
  );
};

export default LandlordReportsPage;
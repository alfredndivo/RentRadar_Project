import React, { useEffect, useState } from "react";
import axios from "axios";

const LandlordReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const landlordId = localStorage.getItem("landlordId"); // Adjust based on your auth logic

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`/api/reports/landlord/${landlordId}`);
        setReports(res.data || []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [landlordId]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Reports Against You</h1>
      {loading ? (
        <p className="text-gray-600">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-600">No reports submitted yet.</p>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white shadow-md rounded-xl p-4 border-l-4 border-red-400"
            >
              <h2 className="font-semibold text-lg text-red-600">{report.title}</h2>
              <p className="text-gray-700 mt-1">{report.description}</p>

              <div className="text-sm text-gray-500 mt-3">
                Reported by:{" "}
                <span className="font-medium text-black">{report.user?.name || "Unknown"}</span>
              </div>

              {report.listing && (
                <div className="mt-2 text-sm text-blue-600">
                  Related Listing: <span className="underline">{report.listing.title}</span>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                Submitted: {new Date(report.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordReportsPage;

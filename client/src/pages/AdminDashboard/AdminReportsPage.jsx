import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const res = await axios.get("/api/reports");
        setReports(res.data || []);
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">All User Reports</h1>

      {loading ? (
        <p className="text-gray-600">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-600">No reports submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white shadow-md border-l-4 border-green-500 rounded-xl p-4"
            >
              <h2 className="text-lg font-semibold text-gray-800">{report.title}</h2>
              <p className="text-gray-700 mt-1">{report.description}</p>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  Reporter:{" "}
                  <span className="font-medium text-black">{report.user?.name || "Unknown"}</span>
                </p>

                {report.landlord && (
                  <p>
                    Against Landlord:{" "}
                    <span className="text-red-600 font-semibold">
                      {report.landlord.name || "Unknown"}
                    </span>
                  </p>
                )}

                {report.listing && (
                  <p>
                    Related Listing:{" "}
                    <span className="text-blue-600 underline">
                      {report.listing.title || "Listing Info"}
                    </span>
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  Submitted: {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;

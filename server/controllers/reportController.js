import Report from '../models/Report.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// 📩 Submit a report
export const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if already reported by this user
    const existing = await Report.findOne({ reportedBy: userId, targetType, targetId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reported this item' });
    }

    const report = new Report({
      reportedBy: userId,
      targetType,
      targetId,
      reason,
      details
    });

    await report.save();

    // // Optional: Email Admin
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `🚨 New report submitted on RentRadar`,
    //   html: `
    //     <p>A user has submitted a new report:</p>
    //     <ul>
    //       <li><strong>Type:</strong> ${targetType}</li>
    //       <li><strong>Target ID:</strong> ${targetId}</li>
    //       <li><strong>Reason:</strong> ${reason}</li>
    //       <li><strong>Details:</strong> ${details || 'N/A'}</li>
    //     </ul>
    //   `
    // });

    res.status(201).json({ message: 'Report submitted' });
  } catch (err) {
    console.error('❌ Report submission error:', err);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

// 📊 Admin: Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean(); // .lean() returns plain JS objects so we can add props

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        if (report.targetType === 'listing') {
          const listing = await Listing.findById(report.targetId).select('title location');
          return { ...report, target: listing };
        } else if (report.targetType === 'user') {
          const user = await User.findById(report.targetId).select('name email');
          return { ...report, target: user };
        }
        return report;
      })
    );

    res.json(populatedReports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};


// 🗑️ Admin: Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndDelete(id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report' });
  }
};

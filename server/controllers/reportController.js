import Report from '../models/Report.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// 📩 Submit a report
export const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid target ID format' });
    }

    // Check if already reported by this user
    const existing = await Report.findOne({ reportedBy: userId, targetType, targetId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reported this item' });
    }

    // Verify target exists
    let targetExists = false;
    if (targetType === 'listing') {
      const listing = await Listing.findById(targetId);
      targetExists = !!listing;
    } else if (targetType === 'user') {
      const user = await User.findById(targetId) || await Landlord.findById(targetId);
      targetExists = !!user;
    }

    if (!targetExists) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    const report = new Report({
      reportedBy: userId,
      targetType,
      targetId,
      reason,
      details
    });

    await report.save();

    // Real-time notification to all admins
    const admins = await Admin.find({});
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        userType: 'Admin',
        type: 'report',
        title: '🚨 New Report Submitted',
        message: `New ${reason} report for ${targetType}`,
        link: '/admin/reports',
        data: { reportId: report._id, targetType, reason },
        priority: 'high'
      });
    }

    // If reporting a landlord or listing, notify the landlord
    if (targetType === 'listing') {
      const listing = await Listing.findById(targetId).populate('landlord');
      if (listing && listing.landlord) {
        await createNotification({
          userId: listing.landlord._id,
          userType: 'Landlord',
          type: 'report',
          title: '⚠️ Report Received',
          message: `Your listing "${listing.title}" has been reported for: ${reason}`,
          link: '/landlord/reports',
          data: { reportId: report._id, listingId: targetId },
          priority: 'high'
        });
      }
    } else if (targetType === 'user') {
      const landlord = await Landlord.findById(targetId);
      if (landlord) {
        await createNotification({
          userId: landlord._id,
          userType: 'Landlord',
          type: 'report',
          title: '⚠️ Report Received',
          message: `You have been reported for: ${reason}`,
          link: '/landlord/reports',
          data: { reportId: report._id },
          priority: 'high'
        });
      }
    }

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

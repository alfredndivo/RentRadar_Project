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

    if (!targetType || !targetId || !reason || !details) {
      return res.status(400).json({ message: 'All fields are required' });
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

    // Verify target exists and populate reference
    let targetRef = null;
    if (targetType === 'listing') {
      const listing = await Listing.findById(targetId).populate('landlord');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      targetRef = listing;
    } else if (targetType === 'user') {
      const user = await User.findById(targetId) || await Landlord.findById(targetId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      targetRef = user;
    }

    const report = new Report({
      reportedBy: userId,
      targetType,
      targetId,
      reason,
      details,
      status: 'pending'
    });

    await report.save();

    // Populate the report for response
    await report.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'targetId', select: 'title name location' }
    ]);

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

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newReport', {
        report,
        message: `New ${reason} report submitted`
      });
    }

    // If reporting a landlord or listing, notify the landlord
    if (targetType === 'listing' && targetRef.landlord) {
      await createNotification({
        userId: targetRef.landlord._id,
        userType: 'Landlord',
        type: 'report',
        title: '⚠️ Report Received',
        message: `Your listing "${targetRef.title}" has been reported for: ${reason}`,
        link: '/landlord/reports',
        data: { reportId: report._id, listingId: targetId },
        priority: 'high'
      });
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

    res.status(201).json({ 
      message: 'Report submitted successfully',
      report 
    });
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
      .lean();

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        let target = null;
        
        if (report.targetType === 'listing') {
          target = await Listing.findById(report.targetId)
            .select('title location landlord')
            .populate('landlord', 'name email');
        } else if (report.targetType === 'user') {
          target = await User.findById(report.targetId).select('name email') ||
                   await Landlord.findById(report.targetId).select('name email');
        }
        
        return { 
          ...report, 
          listing: report.targetType === 'listing' ? target : null,
          landlord: report.targetType === 'listing' ? target?.landlord : null,
          user: report.targetType === 'user' ? target : null
        };
      })
    );

    res.json(populatedReports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// Get user's own reports
export const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate({
        path: 'targetId',
        select: 'title name location'
      })
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching user reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    if (!['pending', 'investigating', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const report = await Report.findByIdAndUpdate(
      id, 
      { 
        status, 
        adminResponse: adminResponse || '',
        updatedAt: new Date() 
      }, 
      { new: true }
    ).populate('reportedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Notify the reporter about status update
    await createNotification({
      userId: report.reportedBy._id,
      userType: 'User',
      type: 'report',
      title: '📋 Report Update',
      message: `Your report has been ${status}${adminResponse ? ': ' + adminResponse : ''}`,
      link: '/user/dashboard/reports',
      priority: 'medium'
    });
    
    res.json({ message: 'Report status updated successfully', report });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ message: 'Failed to update report status' });
  }
};

// 🗑️ Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};
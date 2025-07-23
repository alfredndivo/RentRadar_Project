import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';
import { createNotification } from './notificationController.js';

// 📌 [SUPERADMIN] Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 🔁 [ADMIN] Toggle ban/unban a user
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}` });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling status' });
  }
};

// 🗑️ [ADMIN] Delete a reported listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    await listing.remove();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting listing' });
  }
};

// 🧑‍⚖️ [SUPERADMIN] Promote or demote user role
export const setAdminRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['admin', 'superadmin', 'landlord', 'tenant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: `User role set to ${role}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role' });
  }
};

// 📊 [ADMIN] Get dashboard analytics
export const getAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    const reportCount = await Report.countDocuments();

    const topListings = await Listing.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title location price views');

    res.json({
      stats: {
        users: userCount,
        listings: listingCount,
        reports: reportCount,
      },
      topListings,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// 📨 Send warning message to landlord
export const sendWarningMessage = async (req, res) => {
  try {
    const { landlordId, message, severity = 'medium' } = req.body;
    
    const landlord = await Landlord.findById(landlordId);
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    await createNotification({
      userId: landlordId,
      userType: 'Landlord',
      type: 'warning',
      title: '⚠️ Official Warning',
      message: message,
      link: '/landlord/dashboard',
      priority: severity === 'high' ? 'urgent' : 'high'
    });

    // Emit real-time warning
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${landlordId}`).emit('adminWarning', {
        message,
        severity,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Warning sent successfully' });
  } catch (err) {
    console.error('Error sending warning:', err);
    res.status(500).json({ message: 'Failed to send warning' });
  }
};

// 🚫 Ban listing in real-time
export const banListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const listing = await Listing.findById(id).populate('landlord');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Mark as banned (you can add a banned field to Listing model)
    listing.isBanned = true;
    listing.banReason = reason;
    await listing.save();

    // Notify landlord
    await createNotification({
      userId: listing.landlord._id,
      userType: 'Landlord',
      type: 'ban',
      title: '🚫 Listing Banned',
      message: `Your listing "${listing.title}" has been banned. Reason: ${reason}`,
      link: '/landlord/listings',
      priority: 'urgent'
    });

    // Real-time update to hide listing
    const io = req.app.get('io');
    if (io) {
      io.emit('listingBanned', { listingId: id, reason });
    }

    res.json({ message: 'Listing banned successfully' });
  } catch (err) {
    console.error('Error banning listing:', err);
    res.status(500).json({ message: 'Failed to ban listing' });
  }
};

// 👮 Force logout user
export const forceLogoutUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Emit force logout event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${id}`).emit('forceLogout', {
        reason: reason || 'Account suspended by admin',
        timestamp: new Date()
      });
    }

    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    console.error('Error forcing logout:', err);
    res.status(500).json({ message: 'Failed to force logout' });
  }
};

// 📢 Send global notification
export const sendGlobalNotification = async (req, res) => {
  try {
    const { message, title, type = 'system', priority = 'medium' } = req.body;
    
    // Get all users
    const users = await User.find({});
    const landlords = await Landlord.find({});
    
    // Send to all users
    for (const user of users) {
      await createNotification({
        userId: user._id,
        userType: 'User',
        type,
        title,
        message,
        priority
      });
    }
    
    // Send to all landlords
    for (const landlord of landlords) {
      await createNotification({
        userId: landlord._id,
        userType: 'Landlord',
        type,
        title,
        message,
        priority
      });
    }

    // Emit global notification
    const io = req.app.get('io');
    if (io) {
      io.emit('globalNotification', {
        title,
        message,
        type,
        priority,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Global notification sent successfully' });
  } catch (err) {
    console.error('Error sending global notification:', err);
    res.status(500).json({ message: 'Failed to send global notification' });
  }
};
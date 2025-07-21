import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';

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

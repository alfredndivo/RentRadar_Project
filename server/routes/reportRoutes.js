import express from 'express';
import {
  submitReport,
  getAllReports,
  deleteReport
} from '../controllers/reportController.js';
import Report from '../models/Report.js';

import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

// 📝 Submit a report (listing/user)
router.post('/', protect(), submitReport);

// 📊 Get user's own reports
router.get('/my', protect(), async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// 🔐 Admin: Get all reports
router.get('/', protect(), async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, getAllReports);

// 🔐 Admin: Delete a report
router.delete('/:id', protect(), async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, deleteReport);

export default router;

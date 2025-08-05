import express from 'express';
import {
  submitReport,
  getAllReports,
  deleteReport,
  getUserReports,
  updateReportStatus
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// 📝 Submit a report (listing/user)
router.post('/', protect(), submitReport);

// 📊 Get user's own reports
router.get('/my', protect(), getUserReports);

// 🔐 Admin: Get all reports
router.get('/', protect(), roleCheck(['admin', 'superadmin']), getAllReports);

// 🔐 Admin: Update report status
router.patch('/:id/status', protect(), roleCheck(['admin', 'superadmin']), updateReportStatus);

// 🔐 Admin: Delete a report
router.delete('/:id', protect(), roleCheck(['admin', 'superadmin']), deleteReport);

export default router;
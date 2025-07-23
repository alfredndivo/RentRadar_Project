import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  deleteListing,
  setAdminRole,
  getAnalytics,
  sendWarningMessage,
  banListing,
  forceLogoutUser,
  sendGlobalNotification
} from '../controllers/adminController.js';
import { getAllReports } from '../controllers/reportController.js';

import {protect} from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// 🧑‍⚖️ SuperAdmin Only
router.get('/users', protect(), roleCheck(['superadmin']), getAllUsers);
router.post('/set-role', protect(), roleCheck(['superadmin']), setAdminRole);

// 👮 Admin and SuperAdmin
router.get('/reports', protect(), roleCheck(['admin', 'superadmin']), getAllReports);
router.put('/users/:id/toggle', protect(), roleCheck(['admin', 'superadmin']), toggleUserStatus);
router.delete('/listings/:id', protect(), roleCheck(['admin', 'superadmin']), deleteListing);
router.get('/analytics', protect(), roleCheck(['admin', 'superadmin']), getAnalytics);

// New admin actions
router.post('/send-warning', protect(), roleCheck(['admin', 'superadmin']), sendWarningMessage);
router.post('/ban-listing/:id', protect(), roleCheck(['admin', 'superadmin']), banListing);
router.post('/force-logout/:id', protect(), roleCheck(['admin', 'superadmin']), forceLogoutUser);
router.post('/global-notification', protect(), roleCheck(['admin', 'superadmin']), sendGlobalNotification);

export default router;

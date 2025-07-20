import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  getReports,
  deleteListing,
  setAdminRole,
  getAnalytics,
} from '../controllers/adminController.js';

import {protect} from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// 🧑‍⚖️ SuperAdmin Only
router.get('/users', protect, roleCheck(['superadmin']), getAllUsers);
router.post('/set-role',protect, roleCheck(['superadmin']), setAdminRole);

// 👮 Admin and SuperAdmin
router.get('/reports',protect, roleCheck(['admin', 'superadmin']), getReports);
router.put('/users/:id/toggle',protect, roleCheck(['admin', 'superadmin']), toggleUserStatus);
router.delete('/listings/:id',protect, roleCheck(['admin', 'superadmin']), deleteListing);
router.get('/analytics',protect, roleCheck(['admin', 'superadmin']), getAnalytics);

export default router;

// server/routes/notificationRoutes.js

import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 All routes protected
router.use(protect);

// 📬 GET /api/notifications
router.get('/', getUserNotifications);

// 👁️‍🗨️ PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

// ✅ PATCH /api/notifications/mark-all
router.patch('/mark-all', markAllAsRead);

// ❌ DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

export default router;

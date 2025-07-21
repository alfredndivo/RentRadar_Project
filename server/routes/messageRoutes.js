import express from 'express';
import {
  sendMessage,
  getMessagesWithUser,
  getRecentChats
} from '../controllers/messageController.js';
import {protect} from '../middleware/authMiddleware.js';
import uploadMessageImage from '../middleware/uploadMessageImage.js';

const router = express.Router();

// 💌 Send message (with optional image)
router.post(
  '/',
  protect(),
  uploadMessageImage.single('image'),
  sendMessage
);

// 💬 Get conversation with another user
router.get('/:userId', protect(), getMessagesWithUser);

// 📥 Get recent chat previews
router.get('/recent', protect(), getRecentChats);

export default router;

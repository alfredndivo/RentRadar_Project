import express from 'express';
import {
  sendMessage,
  getChats,
  getChatMessages,
  markMessagesAsSeen,
  createOrGetChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadMessageImage from '../middleware/uploadMessageImage.js';

const router = express.Router();

// All routes are protected
router.use(protect());

// Create or get chat between users
router.post('/create-or-get', createOrGetChat);

// Send message (with optional image)
router.post('/send', uploadMessageImage.single('attachment'), sendMessage);

// Get all chats for current user
router.get('/', getChats);

// Get messages for a specific chat
router.get('/:chatId/messages', getChatMessages);

// Mark messages as seen
router.patch('/:chatId/seen', markMessagesAsSeen);

export default router;
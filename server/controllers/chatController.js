import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';

// Create or get existing chat between two users
export const createOrGetChat = async (req, res) => {
  try {
    const { receiverId, receiverType } = req.body;
    const senderId = req.user._id;
    const senderType = req.user.role === 'landlord' ? 'Landlord' : 'User';

    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('lastMessage');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [senderId, receiverId],
        participantTypes: [senderType, receiverType],
        unreadCount: new Map()
      });
      await chat.save();
    }

    // Populate participants
     await chat.populate({
      path: "participants",
      select: "name email role",
      });


    res.json(chat);
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    res.status(500).json({ message: 'Failed to create or get chat' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, receiverId, content } = req.body;
    const senderId = req.user._id;
    const senderType = req.user.role === 'landlord' ? 'Landlord' : 'User';
    const receiverType = req.user.role === 'landlord' ? 'User' : 'Landlord';

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      // Create or find chat
      chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          participantTypes: [senderType, receiverType],
          unreadCount: new Map()
        });
        await chat.save();
      }
    }

    // Determine message type based on file
    let messageType = 'text';
    if (req.file) {
      messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    }

    const message = new Message({
      senderId,
      senderType,
      receiverId: receiverId || chat.participants.find(p => !p.equals(senderId)),
      receiverType,
      chatId: chat._id,
      content: content || '',
      attachments: req.file ? [req.file.filename] : [],
      messageType
    });

    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    const targetReceiverId = receiverId || chat.participants.find(p => !p.equals(senderId));
    const currentUnreadCount = chat.unreadCount.get(targetReceiverId.toString()) || 0;
    chat.unreadCount.set(targetReceiverId.toString(), currentUnreadCount + 1);
    await chat.save();

    // Populate message for response
    await message.populate([
      { path: 'senderId', select: 'name email' },
      { path: 'receiverId', select: 'name email' }
    ]);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chat._id}`).emit('receiveMessage', message);
      io.to(`user:${targetReceiverId}`).emit('newMessage', {
        chatId: chat._id,
        message: message.content || 'Sent an attachment',
        senderName: req.user.name || req.user.username
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get all chats for current user
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('lastMessage')
    .populate({
      path: 'participants',
      select: 'name email role',
      match: { _id: { $ne: userId } }
    })
    .sort({ updatedAt: -1 });

    // Format response
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => !p._id.equals(userId));
      return {
        _id: chat._id,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount.get(userId.toString()) || 0,
        updatedAt: chat.updatedAt
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ 
      chatId,
      isDeleted: false 
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Update message status
    await Message.updateMany(
      { 
        chatId, 
        receiverId: userId, 
        status: { $ne: 'seen' } 
      },
      { status: 'seen' }
    );

    // Reset unread count
    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.unreadCount.set(userId.toString(), 0);
      await chat.save();
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chatId}`).emit('messagesSeen', { chatId, userId });
    }

    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ message: 'Failed to mark messages as seen' });
  }
};
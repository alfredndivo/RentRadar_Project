import Message from '../models/Message.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import fs from 'fs';

// 📩 Send new message (text/image)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverType, chatId, content } = req.body;
    const senderId = req.user._id;
    const senderType = req.user.role;

    if (!receiverId || !receiverType || !chatId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newMessage = new Message({
      chatId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      content,
      messageType: req.file ? 'image' : 'text',
      image: req.file ? `/uploads/messages/${req.file.filename}` : null
    });

    await newMessage.save();

    // Optional: Email if user is offline (you can modify this to support landlords too)
    const receiver = await User.findById(receiverId); // ⚠️ If receiverType is 'Landlord', use Landlord model
    if (receiver && !receiver.isOnline) {
      await sendEmail({
        to: receiver.email,
        subject: '📬 You have a new message on RentRadar!',
        html: `<p>Hello ${receiver.username},</p>
               <p>You have a new message from ${req.user.username}.</p>
               <p>Login to <a href="https://rentradar.ke">RentRadar</a> to read it now.</p>`
      });
    }

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};


// 💬 Get messages with a specific user (conversation)
export const getMessagesWithUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'name email')   // 🎯 Only select useful fields
      .populate('receiverId', 'name email');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};


// 🧠 Get recent chat users (for sidebar preview)
export const getRecentChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            isOnline: '$user.isOnline'
          },
          lastMessage: {
            text: '$lastMessage.text',
            image: '$lastMessage.image',
            createdAt: '$lastMessage.createdAt'
          }
        }
      }
    ]);

    res.json(recentMessages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load recent chats' });
  }
};



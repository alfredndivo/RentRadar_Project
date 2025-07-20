import Message from '../models/Message.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import fs from 'fs';

// 📩 Send new message (text/image)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId || (!text && !req.file)) {
      return res.status(400).json({ message: 'Message content required' });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || '',
      image: req.file ? `/uploads/messages/${req.file.filename}` : null,
    });

    await newMessage.save();

    // 💌 Email recipient if they're offline (optional enhancement)
    const receiver = await User.findById(receiverId);
    if (receiver && !receiver.isOnline) {
      await sendEmail({
        to: receiver.email,
        subject: '📬 You have a new message on RentRadar!',
        html: `<p>Hello ${receiver.username},</p>
               <p>You have a new message from ${req.user.username}.</p>
               <p>Login to <a href="https://rentradar.ke">RentRadar</a> to read it now.</p>`
      });
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
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



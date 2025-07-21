import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Setup __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

// Initialize app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.originalUrl);
  next();
});
// Static image serving
// Make io available to routes
app.set('io', io);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room user:${userId}`);
  });

  // Join chat room
  socket.on('joinChat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User joined chat room: chat:${chatId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(`chat:${chatId}`).emit('userTyping', { userId, isTyping });
  });

  // Handle message delivery confirmation
  socket.on('messageDelivered', ({ messageId, chatId }) => {
    socket.to(`chat:${chatId}`).emit('messageDelivered', { messageId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});
// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5000;
    server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

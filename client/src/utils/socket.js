import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinChat', chatId);
    }
  }

  sendTyping(chatId, userId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { chatId, userId, isTyping });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onMessageDelivered(callback) {
    if (this.socket) {
      this.socket.on('messageDelivered', callback);
    }
  }

  onMessagesSeen(callback) {
    if (this.socket) {
      this.socket.on('messagesSeen', callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
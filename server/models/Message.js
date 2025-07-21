import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderType',
      required: true
    },
    senderType: {
      type: String,
      enum: ['User', 'Landlord'],
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'receiverType',
      required: true
    },
    receiverType: {
      type: String,
      enum: ['User', 'Landlord'],
      required: true
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    attachments: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent'
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
const Message = mongoose.model('Message', messageSchema);

export default Message;

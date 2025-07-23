// server/models/Notification.js

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userType',
      required: true
    },
    userType: {
      type: String,
      enum: ['User', 'Landlord', 'Admin'],
      required: true
    },
    type: {
      type: String,
      enum: ['message', 'review', 'report', 'listing', 'system', 'booking', 'warning', 'ban'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: {}
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ userType: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);

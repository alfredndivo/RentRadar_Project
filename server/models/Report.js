// server/models/Report.js

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['listing', 'user'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: [
      'Fraudulent',
      'Scam',
      'Unavailable',
      'Rude Behavior',
      'Duplicate Listing',
      'Other'
    ],
    required: true
  },
  details: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);

// server/models/Review.js

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['listing', 'landlord'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);

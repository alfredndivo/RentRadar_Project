import mongoose from 'mongoose';

const propertyAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  criteria: {
    location: String,
    minPrice: Number,
    maxPrice: Number,
    houseType: String,
    minBedrooms: Number,
    maxBedrooms: Number,
    minBathrooms: Number,
    maxBathrooms: Number,
    amenities: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  matchCount: {
    type: Number,
    default: 0
  },
  notificationMethod: {
    type: String,
    enum: ['email', 'sms', 'push', 'all'],
    default: 'email'
  }
}, {
  timestamps: true
});

// Index for efficient queries
propertyAlertSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('PropertyAlert', propertyAlertSchema);
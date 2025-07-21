import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participantTypes'
  }],
  participantTypes: [{
    type: String,
    enum: ['User', 'Landlord']
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ participants: 1 });

export default mongoose.model('Chat', chatSchema);
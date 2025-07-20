import mongoose from 'mongoose';

const landlordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    // ✅ Newly added fields
    idNumber: {
      type: String,
    },
    location: {
      type: String,
    },
    nationalIdPhoto: {
      type: String, // stores filename or full URL
    },

    photo: {
      type: String,
    },
    badge: {
      type: Boolean,
      default: false,
    },
    isBusiness: {
      type: Boolean,
      default: false,
    },
    businessPermit: {
      type: String,
    },
    landDocs: {
      type: [String], // Array of Cloudinary or Firebase URLs
      default: [],
    },
    listingsPosted: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Landlord', landlordSchema);

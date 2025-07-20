import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
    photo: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    contactHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
      },
    ],
    preferences: {
      type: Object,
      default: {},
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
const User = mongoose.model('User',userSchema);
export default User;

import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    
      lat: { type: Number },
      lng: { type: Number }
    ,
    locationFullName: { // Optional, helps for clarity
    type: String
    },
    price: {
      type: Number,
      required: true,
    },
    houseType: {
      type: String,
      enum: [
        'Single Room',
        'Bedsitter',
        'Studio',
        '1 Bedroom',
        '2 Bedroom',
        '3 Bedroom',
        'Maisonette',
        'Bungalow',
        'Apartment',
        'Penthouse',
        'Hostel Room',
        'Servant Quarter',
        'Shared Room',
        'Townhouse',
        'Villa',
      ],
      required: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    images: [String], // Array of resized image paths
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Listing', listingSchema);

import express from 'express';
import {
  createListing,
  getAllListings,
  getSingleListing,
  getMyListings,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';

import  { protect }  from '../middleware/authMiddleware.js';
import uploadListingImage from '../middleware/uploadListingImage.js';

const router = express.Router();

// 🔐 Landlord creates a listing with multiple images
router.post('/', protect('landlord'), uploadListingImage.array('images', 6), createListing);

// 🌍 Get all listings (public or logged in)
router.get('/', getAllListings);
router.get('/my/listings', protect(), getMyListings);
// 📌 Get one listing by ID (public)
router.get('/:id', getSingleListing);

// 🧑‍💼 Get listings by the logged-in landlord


// ✏️ Update listing
router.put('/:id', protect('landlord'), uploadListingImage.array('images', 6), updateListing);

// ❌ Delete listing
router.delete('/:id', protect('landlord'), deleteListing);

export default router;

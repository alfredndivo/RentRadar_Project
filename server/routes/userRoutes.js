import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

const router = express.Router();

// Save a listing
router.post('/save-listing/:id', protect('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;
    
    if (!user.savedListings.includes(listingId)) {
      user.savedListings.push(listingId);
      await user.save();
    }
    
    res.json({ message: 'Listing saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save listing' });
  }
});

// Unsave a listing
router.delete('/unsave-listing/:id', protect('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;
    
    user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
    await user.save();
    
    res.json({ message: 'Listing removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove listing' });
  }
});

// Get saved listings
router.get('/saved-listings', protect('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedListings');
    res.json(user.savedListings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load saved listings' });
  }
});

export default router;
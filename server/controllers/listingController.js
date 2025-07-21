import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Listing from '../models/Listing.js';
import getCoordinates from '../utils/geolocation.js';

const houseTypes = [
  'Single Room', 'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom',
  'Maisonette', 'Bungalow', 'Apartment', 'Penthouse', 'Hostel Room',
  'Servant Quarter', 'Shared Room', 'Townhouse', 'Villa'
];
// 📌 CREATE new listing
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      houseType,
      bedrooms,
      bathrooms,
    } = req.body;

    if (!houseTypes.includes(houseType)) {
      return res.status(400).json({ message: 'Invalid house type' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const resizedPaths = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const ext = path.extname(file.originalname);
      const outputPath = inputPath.replace(ext, `_resized${ext}`);

      await sharp(inputPath)
        .resize(1280, 720, {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath); // delete original
      resizedPaths.push(outputPath);
    }
         let coords = await getCoordinates(location);

          // 🔁 Retry with ", Kenya" if not found and not already present
          if ((!coords || coords.lat == null || coords.lng == null) && !location.toLowerCase().includes('kenya')) {
              coords = await getCoordinates(`${location}, Kenya`);
          }

          if (!coords || coords.lat == null || coords.lng == null) {
              return res.status(400).json({ message: 'Failed to fetch coordinates for location' });
   }


    const newListing = new Listing({
      title,
      description,
      location,
      price,
      houseType,
      bedrooms,
      bathrooms,
      images: resizedPaths,
      landlord: req.user._id,
      lat: coords.lat,
      lng: coords.lng,
    });

    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};


// 📌 GET all listings with optional filters
export const getAllListings = async (req, res) => {
  try {
    const { location, houseType, minPrice, maxPrice } = req.query;
    const query = {};

    if (location) query.location = { $regex: location, $options: 'i' };
    if (houseType) query.houseType = houseType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

// 📌 GET single listing by ID
export const getSingleListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get listing' });
  }
};

// 📌 GET all listings by current landlord
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ landlord: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get your listings' });
  }
};

// 📌 UPDATE listing by ID
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updates = req.body;

    if (updates.houseType && !houseTypes.includes(updates.houseType)) {
      return res.status(400).json({ message: 'Invalid house type' });
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const imgPath of listing.images) {
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
      
      // Process new images
      const resizedPaths = [];
      for (const file of req.files) {
        const inputPath = file.path;
        const ext = path.extname(file.originalname);
        const outputPath = inputPath.replace(ext, `_resized${ext}`);

        await sharp(inputPath)
          .resize(1280, 720, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy
          })
          .jpeg({ quality: 80 })
          .toFile(outputPath);

        fs.unlinkSync(inputPath); // delete original
        resizedPaths.push(outputPath);
      }
      
      updates.images = resizedPaths;
    }

    if (updates.location) {
      let coords = await getCoordinates(updates.location);
      
      if ((!coords || coords.lat == null || coords.lng == null) && !updates.location.toLowerCase().includes('kenya')) {
        coords = await getCoordinates(`${updates.location}, Kenya`);
      }
      
      if (coords && coords.lat != null && coords.lng != null) {
        updates.lat = coords.lat;
        updates.lng = coords.lng;
      }
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ message: 'Failed to update listing' });
  }
};

// 📌 DELETE listing by ID
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    for (const imgPath of listing.images) {
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};
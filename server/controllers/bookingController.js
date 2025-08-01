import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { listingId, visitDate, visitTime, message } = req.body;
    const tenantId = req.user._id;

    const listing = await Listing.findById(listingId).populate('landlord');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listing.landlord) {
      return res.status(400).json({ message: 'Listing does not have a landlord assigned' });
    }

    const existingBooking = await Booking.findOne({
      tenant: tenantId,
      listing: listingId,
      status: 'pending'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a pending booking for this property' });
    }

    const booking = new Booking({
      tenant: tenantId,
      landlord: listing.landlord._id,
      listing: listingId,
      visitDate,
      visitTime,
      message
    });

    await booking.save();
    await booking.populate(['tenant', 'landlord', 'listing']);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${listing.landlord._id}`).emit('newBooking', {
        booking,
        message: `New booking request from ${req.user.name}`
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};


// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate('listing', 'title location price images')
      .populate('landlord', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get landlord's bookings
export const getLandlordBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { landlord: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('tenant', 'name phone email')
      .populate('listing', 'title location price images')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching landlord bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, landlordResponse } = req.body;
    const landlordId = req.user._id;

    const booking = await Booking.findOne({ _id: id, landlord: landlordId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (landlordResponse) {
      booking.landlordResponse = landlordResponse;
    }
    booking.responseDate = new Date();

    await booking.save();
    await booking.populate(['tenant', 'landlord', 'listing']);

    // Emit socket event to tenant
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.tenant._id}`).emit('bookingUpdate', {
        booking,
        message: `Your booking has been ${status}`
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

// Get single booking
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('tenant', 'name phone email')
      .populate('landlord', 'name phone email')
      .populate('listing');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const userId = req.user._id.toString();
    if (booking.tenant._id.toString() !== userId && booking.landlord._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

// Upload photos after visit
export const uploadBookingPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions } = req.body;
    const tenantId = req.user._id;

    const booking = await Booking.findOne({ _id: id, tenant: tenantId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only upload photos for completed visits' });
    }

    const photos = req.files.map((file, index) => ({
      url: file.path,
      caption: captions ? captions[index] : '',
      verified: true,
      uploadedAt: new Date()
    }));

    booking.userPhotos.push(...photos);
    await booking.save();

    res.json({ message: 'Photos uploaded successfully', photos });
  } catch (error) {
    console.error('Error uploading booking photos:', error);
    res.status(500).json({ message: 'Failed to upload photos' });
  }
};
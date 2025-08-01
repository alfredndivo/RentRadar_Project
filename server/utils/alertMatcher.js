import PropertyAlert from '../models/PropertyAlert.js';
import { createNotification } from '../controllers/notificationController.js';
import sendEmail from './sendEmail.js';

/**
 * Check if a new listing matches any user alerts and send notifications
 */
export const checkListingAlerts = async (listing) => {
  try {
    const alerts = await PropertyAlert.find({ isActive: true }).populate('user');
    
    for (const alert of alerts) {
      if (matchesAlert(listing, alert.criteria)) {
        // Update match count
        alert.matchCount += 1;
        alert.lastTriggered = new Date();
        await alert.save();
        
        // Send notification
        await createNotification({
          userId: alert.user._id,
          userType: 'User',
          type: 'listing',
          title: '🏠 New Property Alert',
          message: `New property "${listing.title}" matches your alert "${alert.name}"`,
          link: `/user/dashboard/browse`,
          data: { listingId: listing._id, alertId: alert._id },
          priority: 'medium'
        });
        
        // Send email if enabled
        if (alert.notificationMethod === 'email' || alert.notificationMethod === 'all') {
          await sendEmail({
            to: alert.user.email,
            subject: `🏠 New Property Alert: ${alert.name}`,
            html: `
              <h2>New Property Match!</h2>
              <p>A new property matching your alert "<strong>${alert.name}</strong>" has been posted:</p>
              <div style="background:#f8f9fa;padding:1rem;border-radius:8px;margin:1rem 0;">
                <h3>${listing.title}</h3>
                <p><strong>Location:</strong> ${listing.location}</p>
                <p><strong>Price:</strong> KES ${listing.price?.toLocaleString()}</p>
                <p><strong>Type:</strong> ${listing.houseType}</p>
              </div>
              <p>
                <a href="${process.env.CLIENT_URL}/user/dashboard/browse" 
                   style="background:#10B981;color:white;padding:10px 16px;text-decoration:none;border-radius:5px;">
                  View Property
                </a>
              </p>
            `
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking listing alerts:', error);
  }
};

/**
 * Check if a listing matches alert criteria
 */
const matchesAlert = (listing, criteria) => {
  // Location match
  if (criteria.location && !listing.location.toLowerCase().includes(criteria.location.toLowerCase())) {
    return false;
  }
  
  // Price range
  if (criteria.minPrice && listing.price < criteria.minPrice) {
    return false;
  }
  if (criteria.maxPrice && listing.price > criteria.maxPrice) {
    return false;
  }
  
  // Property type
  if (criteria.houseType && listing.houseType !== criteria.houseType) {
    return false;
  }
  
  // Bedrooms
  if (criteria.minBedrooms && listing.bedrooms < criteria.minBedrooms) {
    return false;
  }
  if (criteria.maxBedrooms && listing.bedrooms > criteria.maxBedrooms) {
    return false;
  }
  
  // Bathrooms
  if (criteria.minBathrooms && listing.bathrooms < criteria.minBathrooms) {
    return false;
  }
  if (criteria.maxBathrooms && listing.bathrooms > criteria.maxBathrooms) {
    return false;
  }
  
  return true;
};

export default { checkListingAlerts };
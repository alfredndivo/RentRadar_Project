// server/utils/geolocation.js

import axios from 'axios';

/**
 * 🔎 Convert a full address into latitude & longitude using Google Maps API.
 * Used when landlord submits a new listing.
 * 
 * @param {string} address - Full address (e.g. "Ngong Road, Nairobi, Kenya")
 * @returns {Object|null} - { lat, lng } or null if failed
 */
export const getCoordinates = async (address) => {
  const encoded = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const result = res.data.results[0];
    if (!result) return null;

    const { lat, lng } = result.geometry.location;
    return { lat, lng };
  } catch (err) {
    console.error('❌ Geocoding failed:', err.message);
    return null;
  }
};

/**
 * 📏 Calculate straight-line distance between two geo-points using Haversine formula
 * Used to show “X km away from your current location” on listings.
 * 
 * @param {number} lat1 - First latitude (e.g. tenant)
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude (e.g. house)
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in kilometers (e.g. 4.2)
 */
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
};

export default getCoordinates;

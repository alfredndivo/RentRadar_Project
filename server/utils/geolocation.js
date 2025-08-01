import axios from 'axios';

/**
 * 🔎 Convert a full address into latitude & longitude using multiple geocoding services.
 * Used when landlord submits a new listing.
 * 
 * @param {string} address - Full address (e.g. "Ngong Road, Nairobi, Kenya")
 * @returns {Object|null} - { lat, lng } or null if failed
 */
export const getCoordinates = async (address) => {
  if (!address || address.trim() === '') {
    console.log('❌ Empty address provided');
    return null;
  }

  const cleanAddress = address.trim();
  console.log(`🔍 Geocoding address: "${cleanAddress}"`);

  // Try multiple geocoding services for better coverage
  const geocodingServices = [
    {
      name: 'Nominatim',
      url: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1&countrycodes=ke`,
      headers: { 'User-Agent': 'RentRadarApp/1.0 (contact@rentradar.com)' }
    },
    {
      name: 'Nominatim Global',
      url: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1`,
      headers: { 'User-Agent': 'RentRadarApp/1.0 (contact@rentradar.com)' }
    }
  ];

  for (const service of geocodingServices) {
    try {
      console.log(`🌐 Trying ${service.name}...`);
      
      const response = await axios.get(service.url, {
        headers: service.headers,
        timeout: 10000 // 10 second timeout
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ Coordinates found via ${service.name}: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
    } catch (error) {
      console.log(`❌ ${service.name} failed:`, error.message);
      continue;
    }
  }

  // If all services fail, try with Kenya suffix
  if (!cleanAddress.toLowerCase().includes('kenya')) {
    console.log('🔄 Retrying with Kenya suffix...');
    return await getCoordinates(`${cleanAddress}, Kenya`);
  }

  // Fallback to Nairobi coordinates for Kenya addresses
  if (cleanAddress.toLowerCase().includes('nairobi') || cleanAddress.toLowerCase().includes('kenya')) {
    console.log('🏙️ Using Nairobi fallback coordinates');
    return { lat: -1.2921, lng: 36.8219 }; // Nairobi city center
  }

  console.log('❌ All geocoding attempts failed');
  return null;
};

/**
 * 📏 Calculate straight-line distance between two geo-points using Haversine formula
 * Used to show "X km away from your current location" on listings.
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
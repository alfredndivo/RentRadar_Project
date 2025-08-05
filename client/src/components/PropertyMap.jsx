import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, Layers, Maximize, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for different property types
const createCustomIcon = (color, type) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <span style="
          color: white;
          font-size: 12px;
          font-weight: bold;
          transform: rotate(45deg);
        ">${type}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
};

const PropertyMap = ({ listings, center, onPropertySelect, filters, className = "" }) => {
  const [mapStyle, setMapStyle] = useState('streets');
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clusteredListings, setClusteredListings] = useState([]);

  const mapStyles = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    // Filter and cluster listings based on current filters
    let filtered = listings;
    
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      filtered = filtered.filter(listing => 
        listing.price >= min && (max ? listing.price <= max : true)
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.houseType === typeFilter);
    }
    
    setClusteredListings(filtered);
  }, [listings, priceFilter, typeFilter]);

  const getMarkerColor = (listing) => {
    if (listing.price < 15000) return '#22c55e'; // Green for affordable
    if (listing.price < 30000) return '#3b82f6'; // Blue for moderate
    if (listing.price < 50000) return '#f59e0b'; // Orange for expensive
    return '#ef4444'; // Red for premium
  };

  const getPropertyTypeAbbr = (type) => {
    const abbr = {
      'Single Room': 'SR',
      'Bedsitter': 'BS',
      'Studio': 'ST',
      '1 Bedroom': '1B',
      '2 Bedroom': '2B',
      '3 Bedroom': '3B',
      'Maisonette': 'MS',
      'Apartment': 'AP'
    };
    return abbr[type] || 'PR';
  };

  const MapController = () => {
    const map = useMap();
    
    const centerOnUser = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        });
      }
    };

    return (
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={centerOnUser}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          title="Center on my location"
        >
          <Navigation className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          title="Map filters"
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="relative">
          <button
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            title="Change map style"
          >
            <Layers className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="absolute right-full mr-2 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1 min-w-32">
            {Object.keys(mapStyles).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  mapStyle === style
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Filters Overlay */}
      {showFilters && (
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 min-w-64">
          <h4 className="font-semibold text-gray-900 dark:text-white">Map Filters</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price Range
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Prices</option>
              <option value="0-15000">Under 15K</option>
              <option value="15000-30000">15K - 30K</option>
              <option value="30000-50000">30K - 50K</option>
              <option value="50000-999999">Above 50K</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="Bedsitter">Bedsitter</option>
              <option value="1 Bedroom">1 Bedroom</option>
              <option value="2 Bedroom">2 Bedroom</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Showing {clusteredListings.length} of {listings.length} properties
            </p>
          </div>
        </div>
      )}

      <MapContainer 
        center={center || [-1.2921, 36.8219]} 
        zoom={12} 
        className={`w-full h-full rounded-2xl ${className}`}
        zoomControl={false}
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <MapController />
        
        {clusteredListings.map((listing) => (
          listing.lat && listing.lng && (
            <Marker
              key={listing._id}
              position={[listing.lat, listing.lng]}
              icon={createCustomIcon(
                getMarkerColor(listing),
                getPropertyTypeAbbr(listing.houseType)
              )}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-64">
                  <div className="flex gap-3">
                    <img
                      src={listing.images?.[0] ? 
                        `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${listing.images[0]}` : 
                        '/placeholder.png'
                      }
                      alt={listing.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{listing.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{listing.location}</p>
                      <p className="text-sm font-bold text-green-600">
                        KES {listing.price?.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {listing.houseType}
                        </span>
                        {listing.bedrooms > 0 && (
                          <span className="text-xs text-gray-600">{listing.bedrooms}BR</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onPropertySelect?.(listing)}
                    className="w-full mt-3 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
        <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Price Legend</h5>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Under 15K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">15K - 30K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">30K - 50K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Above 50K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
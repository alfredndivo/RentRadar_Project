import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Bed, Bath, Heart, Eye, MessageCircle, CheckCircle, Calendar, BarChart3, GitCompare, Star, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { getAllListings, saveListing, unsaveListing, getUserSavedListings } from '../../../api';
import { ListingSkeleton } from '../../components/SkeletonLoader';
import ImageLightbox from '../../components/ImageLightbox';
import AdvancedSearch from '../../components/AdvancedSearch';
import PropertyComparison from '../../components/PropertyComparison';
import ListingDetailsModal from './ListingDetailsModal';
import ContactLandlordModal from './ContactLandlordModal';
import BookingModal from './BookingModal';

const UserListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    houseType: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [savedListings, setSavedListings] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [quickFilters, setQuickFilters] = useState({
    priceRange: 'all',
    propertyType: 'all',
    bedrooms: 'all'
  });

  const houseTypes = [
    'Single Room', 'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom',
    'Maisonette', 'Bungalow', 'Apartment', 'Penthouse', 'Hostel Room',
    'Servant Quarter', 'Shared Room', 'Townhouse', 'Villa'
  ];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under 10K', value: '0-10000' },
    { label: '10K - 25K', value: '10000-25000' },
    { label: '25K - 50K', value: '25000-50000' },
    { label: '50K - 100K', value: '50000-100000' },
    { label: 'Above 100K', value: '100000-999999999' }
  ];

  useEffect(() => {
    fetchListings();
    fetchSavedListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, searchTerm, filters, quickFilters]);

  const fetchListings = async () => {
    try {
      const response = await getAllListings();
      setListings(response.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const response = await getUserSavedListings();
      const savedIds = new Set(response.data.map(listing => listing._id));
      setSavedListings(savedIds);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    }
  };

  const applyFilters = () => {
    let filtered = listings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // House type filter
    if (filters.houseType) {
      filtered = filtered.filter(listing => listing.houseType === filters.houseType);
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(listing => listing.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(listing => listing.price <= parseInt(filters.maxPrice));
    }

    // Quick filters
    if (quickFilters.priceRange !== 'all') {
      const [min, max] = quickFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(listing => 
        listing.price >= min && listing.price <= max
      );
    }

    if (quickFilters.propertyType !== 'all') {
      filtered = filtered.filter(listing => listing.houseType === quickFilters.propertyType);
    }

    if (quickFilters.bedrooms !== 'all') {
      const bedroomCount = parseInt(quickFilters.bedrooms);
      filtered = filtered.filter(listing => listing.bedrooms === bedroomCount);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'most_viewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredListings(filtered);
  };

  const handleSaveListing = async (listingId) => {
    try {
      if (savedListings.has(listingId)) {
        await unsaveListing(listingId);
        setSavedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        toast.success('Listing removed from saved');
      } else {
        await saveListing(listingId);
        setSavedListings(prev => new Set(prev).add(listingId));
        toast.success('Listing saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save listing');
    }
  };

  const openDetailsModal = (listing) => {
    setSelectedListing(listing);
    setShowDetailsModal(true);
  };

  const openContactModal = (listing) => {
    setSelectedListing(listing);
    setShowContactModal(true);
  };

  const openBookingModal = (listing) => {
    setSelectedListing(listing);
    setShowBookingModal(true);
  };
  
  const handleAdvancedSearch = (searchFilters) => {
    setFilters(searchFilters);
  };
  
  const addToComparison = (listing) => {
    if (comparisonList.length >= 3) {
      toast.error('You can compare up to 3 properties');
      return;
    }
    
    if (comparisonList.find(p => p._id === listing._id)) {
      toast.error('Property already in comparison');
      return;
    }
    
    setComparisonList(prev => [...prev, listing]);
    toast.success('Property added to comparison');
  };
  
  const removeFromComparison = (listingId) => {
    setComparisonList(prev => prev.filter(p => p._id !== listingId));
  };

  const openLightbox = (images, index = 0) => {
    const fullImageUrls = images.map(img => getImageUrl(img));
    setLightboxImages(fullImageUrls);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const getPriorityBadge = (listing) => {
    const isNew = (Date.now() - new Date(listing.createdAt)) < 7 * 24 * 60 * 60 * 1000; // 7 days
    const isPopular = (listing.views || 0) > 50;
    const isFeatured = listing.featured;

    if (isFeatured) return { text: 'Featured', color: 'bg-purple-500', icon: <Star className="w-3 h-3" /> };
    if (isNew) return { text: 'New', color: 'bg-green-500', icon: <Zap className="w-3 h-3" /> };
    if (isPopular) return { text: 'Popular', color: 'bg-blue-500', icon: <TrendingUp className="w-3 h-3" /> };
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Perfect Home</h1>
        <p className="text-gray-600 dark:text-gray-300">Discover amazing rental properties across Kenya</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700 sticky top-4 z-30">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          
          {/* Advanced Search */}
          <button
            onClick={() => setShowAdvancedSearch(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Advanced
          </button>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={quickFilters.priceRange}
            onChange={(e) => setQuickFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          <select
            value={quickFilters.propertyType}
            onChange={(e) => setQuickFilters(prev => ({ ...prev, propertyType: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Types</option>
            {houseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={quickFilters.bedrooms}
            onChange={(e) => setQuickFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">Any Bedrooms</option>
            <option value="0">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="most_viewed">Most Viewed</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
                <select
                  value={filters.houseType}
                  onChange={(e) => setFilters(prev => ({ ...prev, houseType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {houseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price (KES)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price (KES)</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setFilters({ location: '', houseType: '', minPrice: '', maxPrice: '', sortBy: 'newest' });
                  setQuickFilters({ priceRange: 'all', propertyType: 'all', bedrooms: 'all' });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Bar */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {comparisonList.length} properties selected for comparison
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowComparison(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Compare
              </button>
              <button
                onClick={() => setComparisonList([])}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-gray-600 dark:text-gray-300">
          Found {filteredListings.length} properties
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="w-4 h-4 flex flex-col gap-0.5">
              <div className="bg-current h-0.5 rounded-sm"></div>
              <div className="bg-current h-0.5 rounded-sm"></div>
              <div className="bg-current h-0.5 rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Listings Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredListings.map((listing) => {
          const priorityBadge = getPriorityBadge(listing);
          
          return (
            <div key={listing._id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-green-100 dark:border-gray-700 ${
              viewMode === 'list' ? 'flex gap-4 p-4' : ''
            }`}>
              {/* Image */}
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48'
              }`}>
                <img
                  src={getImageUrl(listing.images?.[0])}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => listing.images && listing.images.length > 0 && openLightbox(listing.images, 0)}
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />
                
                {/* Priority Badge */}
                {priorityBadge && (
                  <div className={`absolute top-3 left-3 ${priorityBadge.color} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                    {priorityBadge.icon}
                    {priorityBadge.text}
                  </div>
                )}

                {/* Verified Badge */}
                {listing.landlord?.badge && (
                  <div className="absolute top-3 right-12 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}

                <button
                  onClick={() => handleSaveListing(listing._id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                    savedListings.has(listing._id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${savedListings.has(listing._id) ? 'fill-current' : ''}`} />
                </button>
                
                {/* Compare Button */}
                <button
                  onClick={() => addToComparison(listing)}
                  className="absolute bottom-3 right-3 p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-500 transition-all"
                  title="Add to comparison"
                >
                  <GitCompare className="w-4 h-4" />
                </button>

                {/* Image count indicator */}
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                    1/{listing.images.length}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={viewMode === 'list' ? 'flex-1' : 'p-6'}>
                <div className={`${viewMode === 'grid' ? '' : 'p-2'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      KES {listing.price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg">{listing.houseType}</span>
                    {listing.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{listing.bedrooms}</span>
                      </div>
                    )}
                    {listing.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{listing.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views || 0}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{listing.description}</p>

                  {/* Action Buttons */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-wrap' : ''}`}>
                    <button
                      onClick={() => openDetailsModal(listing)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => openBookingModal(listing)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Visit
                    </button>
                    <button
                      onClick={() => openContactModal(listing)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-green-100 dark:border-gray-700">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No properties found</h3>
          <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
      
      {/* Property Comparison Modal */}
      {showComparison && (
        <PropertyComparison
          properties={comparisonList}
          onClose={() => setShowComparison(false)}
          onRemove={removeFromComparison}
        />
      )}

      {/* Modals */}
      {showDetailsModal && selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setShowDetailsModal(false)}
          onContact={() => {
            setShowDetailsModal(false);
            openContactModal(selectedListing);
          }}
          onBook={() => {
            setShowDetailsModal(false);
            openBookingModal(selectedListing);
          }}
          onSave={() => handleSaveListing(selectedListing._id)}
          isSaved={savedListings.has(selectedListing._id)}
        />
      )}

      {showContactModal && selectedListing && (
        <ContactLandlordModal
          listing={selectedListing}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showBookingModal && selectedListing && (
        <BookingModal
          listing={selectedListing}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            toast.success('Booking request sent successfully!');
          }}
        />
      )}
    </div>
  );
};

export default UserListingsPage;
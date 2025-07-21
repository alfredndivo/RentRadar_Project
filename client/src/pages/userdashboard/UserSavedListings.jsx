import React, { useState, useEffect } from "react";
import {
  Heart,
  Eye,
  MessageCircle,
  Trash2,
  MapPin,
  Bed,
  Bath,
} from "lucide-react";
import { toast } from "sonner";
import { getUserSavedListings, unsaveListing } from "../../../api";
import { ListingSkeleton } from "../../components/SkeletonLoader";
import ImageLightbox from "../../components/ImageLightbox";
import ListingDetailsModal from "./ListingDetailsModal";
import ContactLandlordModal from "./ContactLandlordModal";

const UserSavedListings = () => {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const fetchSavedListings = async () => {
    try {
      const response = await getUserSavedListings();
      setSavedListings(response.data || []);
    } catch (error) {
      console.error("Error fetching saved listings:", error);
      // Don't show error for empty saved listings
      setSavedListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveListing = async (listingId) => {
    try {
      await unsaveListing(listingId);
      setSavedListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
      toast.success("Listing removed from saved");
    } catch (error) {
      toast.error("Failed to remove listing");
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

  const openLightbox = (images, index = 0) => {
    const fullImageUrls = images.map(img => getImageUrl(img));
    setLightboxImages(fullImageUrls);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    
    // If it's already a full URL (e.g., from Cloudinary or external source), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local paths, prepend the base URL
    // The imagePath from the server should now include the 'uploads/' prefix
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Listings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Properties you've saved for later
        </p>
      </div>

      {/* Saved Listings */}
      {savedListings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-green-100 dark:border-gray-700">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No saved listings yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start browsing properties and save your favorites
          </p>
          <button
            onClick={() => (window.location.href = "/user/dashboard")}
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-green-100 dark:border-gray-700"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {console.log(
                  `Listing ID: ${listing._id}, Image URL: ${getImageUrl(listing.images?.[0])}`)}
                <img
                  src={
                    listing.images?.[0]
                      ? getImageUrl(listing.images[0])
                      : "/placeholder.png"
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onClick={() =>
                    listing.images &&
                    listing.images.length > 0 &&
                    openLightbox(listing.images, 0)
                  }
                />

                <button
                  onClick={() => handleUnsaveListing(listing._id)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {listing.title}
                  </h3>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    KES {listing.price?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{listing.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg">
                    {listing.houseType}
                  </span>
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
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailsModal(listing)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => openContactModal(listing)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </button>
                  <button
                    onClick={() => handleUnsaveListing(listing._id)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />

      {/* Modals */}
      {showDetailsModal && selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setShowDetailsModal(false)}
          onContact={() => {
            setShowDetailsModal(false);
            openContactModal(selectedListing);
          }}
          onSave={() => handleUnsaveListing(selectedListing._id)}
          isSaved={true}
        />
      )}

      {showContactModal && selectedListing && (
        <ContactLandlordModal
          listing={selectedListing}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default UserSavedListings;

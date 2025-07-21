import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Heart, MessageCircle, Share2, Calendar, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import LocationMap from '../../components/LocationMap';
import ImageLightbox from '../../components/ImageLightbox';


const ListingDetailsModal = ({ listing, onClose, onContact, onSave, isSaved }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);


  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    
    // If it's already a full URL (e.g., from Cloudinary or external source), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local paths, prepend the base URL
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this property: ${listing.title} in ${listing.location}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const handleCall = () => {
    if (listing.landlord?.phone) {
      window.location.href = `tel:${listing.landlord.phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleEmail = () => {
    if (listing.landlord?.email) {
      window.location.href = `mailto:${listing.landlord.email}?subject=Inquiry about ${listing.title}&body=Hi, I'm interested in your property "${listing.title}" located at ${listing.location}. Could you please provide more details?`;
    } else {
      toast.error('Email not available');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="relative mb-6">
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src={getImageUrl(listing.images[currentImageIndex])}
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(currentImageIndex);
                    setLightboxOpen(true);
                  }}
                />
              </div>

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    →
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{listing.location}</span>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <span className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-sm font-medium">
                    {listing.houseType}
                  </span>
                  {listing.bedrooms > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bed className="w-4 h-4" />
                      <span>{listing.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {listing.bathrooms > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bath className="w-4 h-4" />
                      <span>{listing.bathrooms} Bathrooms</span>
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold text-[#10B981] mb-4">
                  KES {listing.price?.toLocaleString()}
                  <span className="text-lg text-gray-600 font-normal">
                    /month
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Property Features
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-gray-600">Spacious rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-gray-600">Modern amenities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-gray-600">Good location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-gray-600">Secure environment</span>
                  </div>
                </div>
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Posted on {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <button
                  onClick={onContact}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 px-4 rounded-xl hover:bg-[#0f766e] transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Landlord
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={onSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-colors ${
                      isSaved
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Alternative Contact Methods */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Or contact directly:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCall}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button
                      onClick={handleEmail}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Landlord Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Property Owner
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {listing.landlord?.name?.charAt(0) || "L"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.landlord?.name || "Property Owner"}
                    </p>
                    <p className="text-sm text-gray-600">Verified Landlord</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Response rate: 95%</p>
                  <p>Responds within 2 hours</p>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Safety Tips
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Always visit the property in person</li>
                  <li>• Verify landlord identity</li>
                  <li>• Don't send money before viewing</li>
                  <li>• Use secure payment methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ImageLightbox
        images={listing.images.map(getImageUrl)}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </div>
  );
};

export default ListingDetailsModal;
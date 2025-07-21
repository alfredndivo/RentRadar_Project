import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Camera,
  X,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyListings, deleteListing, createListing } from "../../../api";
import DarkModeToggle from '../../components/DarkModeToggle';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    houseType: "",
    bedrooms: "",
    bathrooms: "",
    images: [],
  });

  const houseTypes = [
    "Single Room",
    "Bedsitter",
    "Studio",
    "1 Bedroom",
    "2 Bedroom",
    "3 Bedroom",
    "Maisonette",
    "Bungalow",
    "Apartment",
    "Penthouse",
    "Hostel Room",
    "Servant Quarter",
    "Shared Room",
    "Townhouse",
    "Villa",
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await getMyListings();
      setListings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listingId) => {
    const listing = listings.find(l => l._id === listingId);
    if (listing) {
      setEditingListing({
        ...listing,
        images: [] // Reset images for editing
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editingListing.title);
      formData.append("description", editingListing.description);
      formData.append("location", editingListing.location);
      formData.append("price", editingListing.price);
      formData.append("houseType", editingListing.houseType);
      formData.append("bedrooms", editingListing.bedrooms);
      formData.append("bathrooms", editingListing.bathrooms);

      // Only append new images if any were selected
      if (editingListing.images && editingListing.images.length > 0) {
        editingListing.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await updateListing(editingListing._id, formData);
      
      // Update the listing in the state
      setListings(prev => prev.map(listing => 
        listing._id === editingListing._id ? response.data : listing
      ));
      
      setShowEditModal(false);
      setEditingListing(null);
      toast.success("Listing updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update listing");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingListing(prev => ({ ...prev, [name]: value }));

    // Trigger map preview for location input
    if (name === "location") {
      previewMap(value);
    }
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }
    setEditingListing(prev => ({ ...prev, images: files }));
  };

  const handleDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteListing(listingId);
        setListings((prev) => prev.filter((item) => item._id !== listingId));
        toast.success("Listing deleted successfully");
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete listing");
      }
    }
  };

  const previewMap = async (location) => {
    if (!location) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setMapCoords(null);
      }
    } catch (error) {
      console.error("Error fetching map coordinates:", error);
      setMapCoords(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing((prev) => ({ ...prev, [name]: value }));

    // Trigger map preview for location input
    if (name === "location") {
      previewMap(value);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }
    setNewListing((prev) => ({ ...prev, images: files }));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const formData = new FormData();
      formData.append("title", newListing.title);
      formData.append("description", newListing.description);
      formData.append("location", newListing.location);
      formData.append("price", newListing.price);
      formData.append("houseType", newListing.houseType);
      formData.append("bedrooms", newListing.bedrooms);
      formData.append("bathrooms", newListing.bathrooms);

      if (newListing.images.length === 0) {
        toast.error("Please upload at least one image");
        setCreating(false);
        return;
      }

      newListing.images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await createListing(formData);
      setListings((prev) => [response.data, ...prev]);
      setShowCreateModal(false);
      setNewListing({
        title: "",
        description: "",
        location: "",
        price: "",
        houseType: "",
        bedrooms: "",
        bathrooms: "",
        images: [],
      });
      toast.success("Listing created successfully");
    } catch (err) {
      console.error("Create failed:", err.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setCreating(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it starts with uploads/, use it directly
    if (imagePath.startsWith('uploads/')) {
      return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
    }
    
    // Otherwise, assume it's in uploads/listings/
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/listings/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DarkModeToggle />
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DarkModeToggle />
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/landlord/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Listings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your property listings</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-green-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first property listing to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition duration-300 border border-green-100 dark:border-gray-700"
              >
                <div className="relative h-48">
                  <img
                    src={getImageUrl(listing.images?.[0])}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {listing.title}
                  </h2>

                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-2">
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

                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">
                    KES {listing.price?.toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Posted: {new Date(listing.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => handleEdit(listing._id)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Listing Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Listing
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleCreateListing} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newListing.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Modern 2 Bedroom Apartment"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Location and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newListing.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Westlands, Nairobi"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newListing.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Map Preview */}
                {mapCoords && (
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <iframe
                      title="Map Preview"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        mapCoords.lng - 0.01
                      },${mapCoords.lat - 0.01},${mapCoords.lng + 0.01},${
                        mapCoords.lat + 0.01
                      }&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lng}`}
                    ></iframe>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Preview of selected location
                    </p>
                  </div>
                )}

                {/* House Type and Rooms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="houseType"
                      value={newListing.houseType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Type</option>
                      {houseTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={newListing.bedrooms}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={newListing.bathrooms}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={newListing.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your property, amenities, and any special features..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Images */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Images (Up to 6) *
                  </label>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const image = newListing.images[i];

                      return (
                        <div
                          key={i}
                          className="relative w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                        >
                          {image ? (
                            <>
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedImages = [...newListing.images];
                                  updatedImages.splice(i, 1);
                                  setNewListing((prev) => ({
                                    ...prev,
                                    images: updatedImages,
                                  }));
                                }}
                                className="absolute top-1 right-1 bg-white dark:bg-black rounded-full p-1 shadow"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                id={`image-input-${i}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const updatedImages = [...newListing.images];
                                    updatedImages[i] = file;
                                    setNewListing((prev) => ({
                                      ...prev,
                                      images: updatedImages,
                                    }));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`image-input-${i}`}
                                className="cursor-pointer"
                              >
                                <Camera className="w-6 h-6 text-gray-400" />
                              </label>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Listing Modal */}
        {showEditModal && editingListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Listing
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingListing(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleUpdateListing} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editingListing.title}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Location and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={editingListing.location}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editingListing.price}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* House Type and Rooms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="houseType"
                      value={editingListing.houseType}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Type</option>
                      {houseTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={editingListing.bedrooms}
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={editingListing.bathrooms}
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editingListing.description}
                    onChange={handleEditInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Images (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to keep existing images. Select new images to replace all.
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingListing(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Listing"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
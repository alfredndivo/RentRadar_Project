import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { getUserBookings, uploadBookingPhotos } from '../../../api';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getUserBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    setPhotos(files);
    setCaptions(new Array(files.length).fill(''));
  };

  const handleCaptionChange = (index, caption) => {
    const newCaptions = [...captions];
    newCaptions[index] = caption;
    setCaptions(newCaptions);
  };

  const handleUploadPhotos = async () => {
    if (!selectedBooking || photos.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      photos.forEach((photo, index) => {
        formData.append('photos', photo);
      });
      formData.append('captions', JSON.stringify(captions));

      await uploadBookingPhotos(selectedBooking._id, formData);
      toast.success('Photos uploaded successfully!');
      setShowPhotoModal(false);
      setPhotos([]);
      setCaptions([]);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your property visit requests and appointments</p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-green-100 dark:border-gray-700">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start browsing properties and book visits</p>
          <button
            onClick={() => window.location.href = '/user/dashboard'}
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-green-100 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Property Image */}
                <div className="lg:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <img
                    src={getImageUrl(booking.listing?.images?.[0])}
                    alt={booking.listing?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {booking.listing?.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{booking.listing?.location}</span>
                      </div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        KES {booking.listing?.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(booking.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {booking.visitTime}
                        </span>
                      </div>
                    </div>

                    {/* Landlord Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.landlord?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Property Owner</p>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Message:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {booking.landlordResponse && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Landlord Response:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {booking.landlordResponse}
                        </p>
                      </div>
                    )}

                    {/* Contact Actions */}
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`tel:${booking.landlord?.phone}`}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      <a
                        href={`mailto:${booking.landlord?.email}`}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                      
                      {/* Photo Upload for Completed Visits */}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowPhotoModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          Add Photos
                        </button>
                      )}
                    </div>

                    {/* User Photos */}
                    {booking.userPhotos && booking.userPhotos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Photos:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {booking.userPhotos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={getImageUrl(photo.url)}
                                alt={photo.caption || `Photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <div className="absolute top-1 right-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                                Verified
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Visit Photos
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Property: <strong>{selectedBooking.listing?.title}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload photos from your visit to help other users
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Photos (Max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {photos.length > 0 && (
                <div className="mb-6 space-y-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="flex gap-3">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Add caption (optional)"
                        value={captions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPhotoModal(false);
                    setPhotos([]);
                    setCaptions([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPhotos}
                  disabled={uploading || photos.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
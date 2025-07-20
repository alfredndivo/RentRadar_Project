import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const landlordId = localStorage.getItem('landlordId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get(`/api/listings/landlord/${landlordId}`);
        setListings(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    if (landlordId) fetchListings();
    else {
      setLoading(false);
      toast.error('Landlord ID not found in localStorage');
    }
  }, [landlordId]);

  const handleEdit = (listingId) => {
    navigate(`/landlord/edit-listing/${listingId}`);
  };

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/api/listings/${listingId}`);
        setListings((prev) => prev.filter((item) => item._id !== listingId));
        toast.success('Listing deleted successfully');
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error('Failed to delete listing');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 text-lg">Loading listings...</div>
    );
  }

  if (!listings.length) {
    return (
      <div className="text-center py-20 text-gray-500 text-xl">
        You haven’t added any listings yet.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Listings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
          >
            <img
              src={listing.images?.[0] || '/placeholder.jpg'}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{listing.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{listing.location}</p>
              <p className="text-sm text-blue-600 font-semibold mt-1">
                KES {listing.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Posted: {new Date(listing.createdAt).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleEdit(listing._id)}
                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(listing._id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsPage;

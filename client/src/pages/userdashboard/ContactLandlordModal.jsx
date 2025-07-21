import React, { useState } from 'react';
import { X, Send, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createOrGetChat, sendChatMessage } from '../../../api';
import { useNavigate } from 'react-router-dom';

const ContactLandlordModal = ({ listing, onClose }) => {
  const [message, setMessage] = useState(`Hi, I'm interested in your property "${listing.title}" located at ${listing.location}. Could you please provide more details?`);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    // If it's already a full URL (e.g., from Cloudinary or external source), return as is
    if (imagePath.startsWith('http')) return imagePath;
    // For local paths, prepend the base URL
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${imagePath}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      // First create or get the chat
      const chatResponse = await createOrGetChat({
        receiverId: listing.landlord._id || listing.landlord,
        receiverType: 'Landlord'
      });
      
      const chat = chatResponse.data;
      
      // Send the message
      await sendChatMessage({
        chatId: chat._id,
        receiverId: listing.landlord._id || listing.landlord,
        content: message
      });
      
      toast.success('Message sent! Redirecting to chat...');
      onClose();
      
      // Navigate to messages page
      setTimeout(() => {
        navigate('/user/dashboard/messages');
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
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
      window.location.href = `mailto:${listing.landlord.email}?subject=Inquiry about ${listing.title}&body=${encodeURIComponent(message)}`;
    } else {
      toast.error('Email not available');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Contact Landlord</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <img 
                src={getImageUrl(listing.images?.[0])}
                alt={listing.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-1">{listing.title}</h4>
                <p className="text-sm text-gray-600">{listing.location}</p>
                <p className="text-sm font-semibold text-[#10B981]">
                  KES {listing.price?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Landlord Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {listing.landlord?.name?.charAt(0) || 'L'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {listing.landlord?.name || 'Property Owner'}
              </p>
              <p className="text-sm text-gray-600">Verified Landlord</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
                placeholder="Type your message here..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl hover:bg-[#0f766e] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Message
              </button>
            </div>
          </form>

          {/* Alternative Contact Methods */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Or contact directly:</p>
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
      </div>
    </div>
  );
};

export default ContactLandlordModal;
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, updateUserProfile } from '../../../api';
import { ProfileSkeleton } from '../../components/SkeletonLoader';
import ProfileCompletionBar from '../../components/ProfileCompletionBar';

const UserProfilePage = () => {
  const { user: contextUser } = useOutletContext();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    preferences: '',
    photo: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getCurrentUser();
      const userData = response.data.profile;
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        preferences: userData.preferences || '',
        photo: userData.photo || null
      });
      if (userData.photo) {
        setPhotoPreview(userData.photo);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to context user data
      if (contextUser) {
        setProfile(prev => ({
          ...prev,
          name: contextUser.name || '',
          email: contextUser.email || '',
          phone: contextUser.phone || '',
          location: contextUser.location || '',
          preferences: contextUser.preferences || ''
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (profile[key] !== null && profile[key] !== undefined) {
          formData.append(key, profile[key]);
        }
      });

      const response = await updateUserProfile(formData);
      
      // Update local state with response data
      if (response.data) {
        setProfile(prev => ({
          ...prev,
          ...response.data,
          photo: response.data.photo || prev.photo
        }));
        
        if (response.data.photo) {
          setPhotoPreview(response.data.photo);
        }
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
      </div>

      {/* Profile Completion */}
      <ProfileCompletionBar user={profile} userType="user" />

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload a photo to personalize your profile</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                placeholder="e.g., Nairobi, Kenya"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Housing Preferences
            </label>
            <textarea
              name="preferences"
              value={profile.preferences}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your ideal housing preferences (e.g., budget range, preferred locations, amenities, etc.)"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates about new listings and messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get text messages for urgent updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
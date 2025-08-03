import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
    // 'Content-Type': 'multipart/form-data',
  },
});


/// ----------------- AUTH -----------------
export const registerUser = (data) => API.post('/auth/user/register', data);
export const loginUser = (data) => API.post('/auth/user/login', data);

export const registerLandlord = (data) => API.post('/auth/landlord/register', data);
export const loginLandlord = (data) => API.post('/auth/landlord/login', data);

export const loginAdmin = (data) => API.post('/auth/admin/login', data);

export const logoutUser = () => API.post('/auth/logout');
export const getCurrentUser = () => API.get('/auth/profile');
export const updateLandlordProfile = (data) =>
  API.put('/auth/landlord/profile', data);
export const updateUserProfile = (data) => API.put('/auth/user/profile', data);

// ----------------- LISTINGS -----------------

export const getAllListings = () => API.get('/listings');
export const getListingById = (id) => API.get(`/listings/${id}`);
export const createListing = (data) => API.post('/listings', data);
export const updateListing = (id, data) => API.put(`/listings/${id}`, data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getMyListings = () => API.get('/listings/my/listings');
export const getUserSavedListings = () => API.get('/user/saved-listings');
export const saveListing = (id) => API.post(`/user/save-listing/${id}`);
export const unsaveListing = (id) => API.delete(`/user/unsave-listing/${id}`);

// ----------------- MESSAGES -----------------

export const getRecentChats = () => API.get('/messages/recent');
export const getMessagesWithUser = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (data) => API.post('/messages', data);

// ----------------- CHATS (New Real-time) -----------------

export const createOrGetChat = (data) => API.post('/chats/create-or-get', data);
export const getChats = () => API.get('/chats');
export const getChatMessages = (chatId, page = 1) => API.get(`/chats/${chatId}/messages?page=${page}`);
export const markMessagesAsSeen = (chatId) => API.patch(`/chats/${chatId}/seen`);
export const sendChatMessage = (data) => API.post('/chats/send', data);
// ----------------- REPORTS -----------------

export const submitReport = (data) => API.post('/reports', data);
export const getUserReports = () => API.get('/reports/my');
export const getAllReportsForAdmin = () => API.get('/reports');


// ----------------- ADMIN -----------------

export const getAdminUsers = () => API.get('/admin/users');
export const getAdminListings = () => API.get('/admin/listings');
export const getAdminAnalytics = () => API.get('/admin/analytics');
export const toggleUserStatus = (userId) => API.put(`/admin/users/${userId}/toggle`);
export const deleteAdminListing = (listingId) => API.delete(`/admin/listings/${listingId}`);
// ----------------- OTHER -----------------
// ----------------- BOOKINGS -----------------

export const createBooking = (data) => API.post('/bookings', data);
export const getUserBookings = () => API.get('/bookings/my-bookings');
export const getLandlordBookings = (status) => API.get(`/bookings/landlord-bookings${status ? `?status=${status}` : ''}`);
export const updateBookingStatus = (id, data) => API.patch(`/bookings/${id}/status`, data);
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const uploadBookingPhotos = (id, data) => API.post(`/bookings/${id}/photos`, data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// ----------------- ADMIN ACTIONS -----------------
export const sendWarningMessage = (data) => API.post('/admin/send-warning', data);
export const banListing = (id, data) => API.post(`/admin/ban-listing/${id}`, data);
export const forceLogoutUser = (id, data) => API.post(`/admin/force-logout/${id}`, data);
export const sendGlobalNotification = (data) => API.post('/admin/global-notification', data);

export const updateProfile = (data) => API.put('/me/update', data);
// export const updateUserProfile = (data) => API.put('/auth/me/update', data);

// ----------------- REVIEWS -----------------
export const submitReview = (data) => API.post('/reviews', data);
export const getUserReviews = () => API.get('/reviews/my');
export const getLandlordReviews = () => API.get('/reviews/landlord/my');
export const getReviewsByTarget = (targetType, targetId) => API.get(`/reviews/${targetType}/${targetId}`);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

export default API;
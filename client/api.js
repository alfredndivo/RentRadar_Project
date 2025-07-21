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
export const updateListing = (id, data) => API.put(`/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getMyListings = () => API.get('/listings/my/listings');
export const getUserSavedListings = () => API.get('/user/saved-listings');
export const saveListing = (id) => API.post(`/user/save-listing/${id}`);
export const unsaveListing = (id) => API.delete(`/user/unsave-listing/${id}`);

// ----------------- MESSAGES -----------------

export const getRecentChats = () => API.get('/messages/recent');
export const getMessagesWithUser = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (data) => API.post('/messages', data);

// ----------------- REPORTS -----------------

export const submitReport = (data) => API.post('/reports', data);
export const getUserReports = () => API.get('/reports/my');
export const getAllReportsForAdmin = () => API.get('/auth/admin/reports');

// ----------------- OTHER -----------------

export const updateProfile = (data) => API.put('/me/update', data);

export default API;

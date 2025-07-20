import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// ----------------- AUTH -----------------
export const registerUser = (data) => API.post('/user/register', data);
export const loginUser = (data) => API.post('/user/login', data);

export const registerLandlord = (data) => API.post('/landlord/register', data);
export const loginLandlord = (data) => API.post('/landlord/login', data);

export const loginAdmin = (data) => API.post('/admin/login', data);

export const logoutUser = () => API.post('/logout');
export const getCurrentUser = () => API.get('/profile');
export const getProfile = () => API.get('/profile');
export const updateLandlordProfile = (data) =>
  API.put('/landlord/profile', data);
export const updateUserProfile = (data) => API.put('/me/update', data);

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
export const getUserReports = () => API.get('/reports');
export const getAllReportsForAdmin = () => API.get('/admin/reports');

// ----------------- OTHER -----------------

export const updateProfile = (data) => API.put('/me/update', data);

export default API;

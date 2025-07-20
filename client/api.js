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

export const logoutUser = () => API.post('/logout');
export const getCurrentUser = () => API.get('/me');
export const getProfile = () => API.get('/profile');
export const updateLandlordProfile = (data) =>
  API.put('/landlord/profile', data);

// ----------------- LISTINGS -----------------

export const getAllListings = () => API.get('/listings');
export const getListingById = (id) => API.get(`/listings/${id}`);
export const createListing = (data) => API.post('/listings', data);
export const updateListing = (id, data) => API.put(`/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getUserSavedListings = () => API.get('/listings/saved');
export const saveListing = (id) => API.post(`/listings/save/${id}`);
export const unsaveListing = (id) => API.delete(`/listings/unsave/${id}`);

// ----------------- MESSAGES -----------------

export const getRecentChats = () => API.get('/messages/recent');
export const getMessagesWithUser = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (data) => API.post('/messages', data);

// ----------------- REPORTS -----------------

export const submitReport = (data) => API.post('/reports', data);
export const getUserReports = () => API.get('/reports/user');
export const getLandlordReports = () => API.get('/reports/landlord');
export const getAllReportsForAdmin = () => API.get('/reports/admin');

// ----------------- OTHER -----------------

export const updateProfile = (data) => API.put('/profile', data);

export default API;

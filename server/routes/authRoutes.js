import express from 'express';
const router = express.Router();

import {
  registerUser,
  loginUser,
  registerLandlord,
  loginLandlord,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfile,
} from '../controllers/authController.js';

import {protect}  from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
 
// =============== USERS ===============
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/user/forgot-password', forgotPassword);
router.post('/user/reset-password/:token', resetPassword);

// =============== LANDLORDS ===============
router.post('/landlord/register', registerLandlord);
router.post('/landlord/login', loginLandlord);
router.post('/landlord/forgot-password', forgotPassword);
router.post('/landlord/reset-password/:token', resetPassword);

// ✅ NEW: Update landlord profile
router.put(
  '/landlord/profile',
  protect('landlord'),
  upload.single('nationalIdPhoto'),
  updateProfile
);

// =============== ADMIN ===============
router.post('/admin/login', loginAdmin);


// =============== PROTECTED ROUTES ===============
router.get('/profile', protect(), getMyProfile);
router.put('/me/update', protect(), upload.single('photo'), updateProfile);

// =============== LOGOUT ===============
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;

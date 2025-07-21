import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';
import sendEmail from '../utils/sendEmail.js';

// JWT Generator
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// =============== USER ================

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, phone, password: hashed });

    const token = generateToken({ id: user._id, role: 'user' });
    res.cookie('token',token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite:'None',
      maxAge: 24 * 60 * 60 * 1000
    })
    .status(201).json({
      message:'User registered successfully',
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        photo: user.photo,
        preferences: user.preferences,
        location: user.location,
        role:'user',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'User registration failed', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: user._id, role: 'user' });
    res.cookie('token',token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:'None',
      maxAge: 24 * 60 * 60 * 1000
    })
    .status(200).json({
      message:'User logged in successfully',
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        photo: user.photo,
        preferences: user.preferences,
        location: user.location,
        role:'user',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// =============== LANDLORD ================

export const registerLandlord = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await Landlord.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const landlord = await Landlord.create({ name, email, phone, password: hashed });

    const token = generateToken({ id: landlord._id, role: 'landlord' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Landlord registered successfully',
      landlord: {
        id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        idNumber: landlord.idNumber,
        location: landlord.location,
        nationalIdPhoto: landlord.nationalIdPhoto,
        role: 'landlord',
      },
    });
  } catch (err) {
    console.error('Landlord registration error:', err);
    res.status(500).json({ message: 'Landlord registration failed', error: err.message });
  }
};

export const loginLandlord = async (req, res) => {
  try {
    const { email, password } = req.body;

    const landlord = await Landlord.findOne({ email });
    if (!landlord) return res.status(404).json({ message: 'Landlord not found' });

    const isMatch = await bcrypt.compare(password, landlord.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: landlord._id, role: 'landlord' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Landlord logged in successfully',
      landlord: {
        id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        idNumber: landlord.idNumber,
        location: landlord.location,
        nationalIdPhoto: landlord.nationalIdPhoto,
        role: 'landlord',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Landlord login failed', error: err.message });
  }
};

// =============== ADMIN LOGIN ================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: admin._id, role: admin.superAdmin ? 'superadmin' : 'admin' });
    res.cookie('token',token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:'None',
      maxAge: 24 * 60 * 60 * 1000
    })
    .status(200).json({
      message:'Admin logged in successfully',
      admin:{
        id:admin._id,
        username:admin.username,
        email:admin.email,
        role: admin.superAdmin ? 'superadmin' : 'admin',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Admin login failed', error: err.message });
  }
};

// =============== PROFILE ================

export const getMyProfile = async (req, res) => {
  console.log('✅ getMyProfile controller hit');

  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    // Normalize the profile fields regardless of role
    const profileData = {
      _id: user._id,
      name: user.name || user.username || '',
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      location: user.location || null,
      idNumber: user.idNumber || null,
      photo: user.photo || user.nationalIdPhoto || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // ✅ Return in consistent format expected by frontend
    res.json({ profile: profileData, role: user.role });
  } catch (err) {
    console.error('❌ getMyProfile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { _id: id, role } = req.user;

    console.log('✅ req.body:', req.body);
    console.log('✅ req.file:', req.file);

    const updateData = { ...req.body };

    // ✅ Save full path (e.g., uploads/profile/photo.jpg)
    if (req.file) {
      const filePath = req.file.path; // already includes "uploads/..."
      
      if (role === 'landlord') {
        updateData.nationalIdPhoto = filePath;
      } else {
        updateData.photo = filePath;
      }
    }

    let Model;
    if (role === 'user') Model = User;
    else if (role === 'landlord') Model = Landlord;
    else if (role === 'admin') Model = Admin;
    else return res.status(400).json({ message: 'Invalid role' });

    const updated = await Model.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json({ message: 'Profile updated', data: updated });
  } catch (err) {
    console.error('❌ Profile update failed:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


// =============== FORGOT / RESET PASSWORD ================

export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    const Model = role === 'user' ? User :
                  role === 'landlord' ? Landlord :
                  null;

    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}?role=${role}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your RentRadar Password',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="background:#0D9488;color:white;padding:10px 16px;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <br/>
        <p style="font-size:0.9rem;">If you didn't request a password reset, ignore this email.</p>
      `
    });

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Forgot password failed', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, role } = req.body;

  try {
    const Model = role === 'user' ? User :
                  role === 'landlord' ? Landlord :
                  null;

    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await Model.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token expired or invalid' });

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};
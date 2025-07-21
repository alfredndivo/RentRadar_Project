import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';

export const protect = (requiredRole = null) => {
  return async (req, res, next) => {
    console.log('Protect middleware hit for:', req.originalUrl);
    try {
      const token = req.cookies?.token;

      if (!token) {
        console.log('No token found in cookies');
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      let user;
      if (decoded.role === 'user') {
        user = await User.findById(decoded.id).select('-password');
        if (user) user.role = 'user';
      } else if (decoded.role === 'landlord') {
        user = await Landlord.findById(decoded.id).select('-password');
        if (user) user.role = 'landlord';
      } else if (decoded.role === 'admin' || decoded.role === 'superadmin') {
        user = await Admin.findById(decoded.id).select('-password');
        if (user) {
          user.role = decoded.role;
          // Ensure superadmin status is preserved
          if (user.superAdmin) {
            user.role = 'superadmin';
          }
        }
      } else {
        console.log('Invalid role in token:', decoded.role);
        return res.status(403).json({ message: 'Invalid role in token' });
      }

      if (!user) {
        console.log('User not found for ID:', decoded.id);
        return res.status(404).json({ message: 'User not found' });
      }

      // If a specific role is required, check it
      if (requiredRole && user.role !== requiredRole) {
        console.log('Role mismatch. Required:', requiredRole, 'Got:', user.role);
        return res.status(403).json({ message: `Access denied. Required role: ${requiredRole}` });
      }

      console.log('Auth successful for user:', user._id, 'Role:', user.role);
      req.user = user;
      next();
    } catch (err) {
      console.error('Protect middleware error:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
};
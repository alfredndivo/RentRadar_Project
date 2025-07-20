import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';

export const protect = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.token;

      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      if (decoded.role === 'user') {
        user = await User.findById(decoded.id).select('-password');
        user.role = 'user';
      } else if (decoded.role === 'landlord') {
        user = await Landlord.findById(decoded.id).select('-password');
        user.role = 'landlord';
      } else if (decoded.role === 'admin' || decoded.role === 'superadmin') {
        user = await Admin.findById(decoded.id).select('-password');
        user.role = decoded.role;
      } else {
        return res.status(403).json({ message: 'Invalid role in token' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If a specific role is required, check it
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: `Access denied. Required role: ${requiredRole}` });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Protect middleware error:', err);
      res.status(401).json({ message: 'Token is invalid or expired' });
    }
  };
};
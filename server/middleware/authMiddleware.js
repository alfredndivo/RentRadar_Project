import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';

const roleModelMap = {
  user: User,
  landlord: Landlord,
  admin: Admin,
  superadmin: Admin,
};

export const protect = (requiredRole = null) => {
  return async (req, res, next) => {
    console.log('[PROTECT] Route:', req.originalUrl);

    try {
      const token = req.cookies?.token;

      if (!token) {
        console.warn('[PROTECT] No token found in cookies');
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[PROTECT] Decoded JWT:', decoded);

      const { id, role } = decoded;
      const Model = roleModelMap[role];

      if (!Model) {
        console.error('[PROTECT] Invalid role in token:', role);
        return res.status(403).json({ message: 'Invalid role in token' });
      }

      const user = await Model.findById(id).select('-password');
      if (!user) {
        console.error('[PROTECT] No user found for role:', role, 'and ID:', id);
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role; // Explicitly add role to user object
      req.user = user;

      if (requiredRole && user.role !== requiredRole) {
        console.warn('[PROTECT] Role mismatch. Required:', requiredRole, 'Got:', user.role);
        return res.status(403).json({ message: `Access denied. Required role: ${requiredRole}` });
      }

      console.log('[PROTECT] Auth success. User ID:', user._id, '| Role:', user.role);
      next();
    } catch (err) {
      console.error('[PROTECT] Middleware error:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

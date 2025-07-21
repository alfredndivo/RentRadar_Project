export const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    console.log(`[ROLE CHECK] Allowed roles: ${allowedRoles}`);
    console.log(`[ROLE CHECK] User role: ${req.user?.role}`);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log(`[ROLE CHECK] ❌ Access denied`);
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    console.log(`[ROLE CHECK] ✅ Access granted`);
    next();
  };
};

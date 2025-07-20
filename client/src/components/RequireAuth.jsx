import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }) => {
  // Check if user data exists in localStorage
  const userData = localStorage.getItem('user');

  if (!userData) {
    console.log('❌ No user data found in localStorage');
    // Clear any corrupted data
    localStorage.clear();
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userData);
    const userRole = user.role;

    console.log('✅ User data found:', { id: user.id, role: userRole });
    console.log('✅ Allowed roles:', allowedRoles);

    if (!userRole) {
      console.log('❌ No role found in user data');
      localStorage.clear();
      return <Navigate to="/auth" replace />;
    }

    // Check if user object has required fields
    if (!user.id && !user._id) {
      console.log('❌ Invalid user data - missing ID');
      localStorage.clear();
      return <Navigate to="/auth" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ User role not allowed:', userRole);
      return <Navigate to="/auth" replace />;
    }

    console.log('✅ Access granted for role:', userRole);
    return <Outlet />;
  } catch (err) {
    console.error('❌ Auth error:', err);
    localStorage.clear(); // Clear all corrupted data
    return <Navigate to="/auth" replace />;
  }
};

export default RequireAuth;
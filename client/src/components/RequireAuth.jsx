import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../api';

const RequireAuth = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
  const checkAuth = async () => {
    console.log('🔁 Checking auth for roles:', allowedRoles);
    try {
      const response = await getCurrentUser();

      console.log('✅ Raw backend response:', response);

      // ✅ Handles both { user: {...} } and raw {...}
      const user = response?.data?.user || response?.data;
      const role = user?.role;
      console.log('✅ Extracted user:', user);
      console.log('✅ Extracted role:', role);

      if (user && allowedRoles.includes(role)) {
        console.log('🟢 Access granted for role:', role);
        setUser(user);
        setError(false);
      } else {
        console.warn('🚫 Access denied for role:', role, '| Allowed:', allowedRoles);
        setError(true);
      }
    } catch (err) {
      console.error('❌ Auth check failed (maybe not logged in?):', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, [allowedRoles]);

  if (loading) {
    console.log('⏳ Still loading auth status...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    console.warn('🔁 Redirecting to /auth due to failed auth or no user...');
    return <Navigate to="/auth" replace />;
  }

  console.log('✅ Rendering outlet for authenticated user');
  return <Outlet context={{ user }} />;
};

export default RequireAuth;

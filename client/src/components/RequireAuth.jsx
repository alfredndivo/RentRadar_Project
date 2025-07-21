import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../api';

const RequireAuth = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        const { profile, role } = response.data;

        console.log('Auth check response:', profile, role);

        // Handle both profile.role and role from response
        const userRole = role || profile?.role;
        
        console.log('User role:', userRole, 'Allowed roles:', allowedRoles);
        
        if (profile && userRole && allowedRoles.includes(userRole)) {
          setUser(profile);
          setError(false);
        } else {
          console.log('User role not allowed:', userRole, 'Allowed:', allowedRoles);
          setError(true);
        }
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
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
    return <Navigate to="/auth" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default RequireAuth;

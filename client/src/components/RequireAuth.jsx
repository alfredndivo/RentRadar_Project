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
        const userData = response.data.profile;
        
        if (userData && allowedRoles.includes(userData.role)) {
          setUser(userData);
        } else {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default RequireAuth;
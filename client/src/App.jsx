import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/userdashboard/UserDashboard';
import LandlordDashboard from './pages/Landlorddashboard/Landlorddashboard';

import LandlordListingsPage from './pages/Landlorddashboard/ListingsPage';
import LandlordMessagesPage from './pages/Landlorddashboard/LandlordMessagesPage';
import LandlordReportsPage from './pages/LandlordDashboard/LandlordReportsPage';
import LandlordCompleteProfile from './pages/Landlorddashboard/LandlordCompleteProfile';

import AdminReportsPage from './pages/AdminDashboard/AdminReportsPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminUsersPage from './pages/AdminDashboard/AdminUsersPage';
import AdminAnalyticsPage from './pages/AdminDashboard/AdminAnalyticsPage';

import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <Routes>
      {/* Default redirect to auth */}
      <Route path="/" element={<Navigate to="/auth" />} />

      {/* Auth route */}
      <Route path="/auth" element={<AuthPage />} />

      {/* User protected routes */}
      <Route element={<RequireAuth allowedRoles={['user']} />}>
        <Route path="/user/dashboard/*" element={<UserDashboard />} />
      </Route>

      {/* Landlord protected routes */}
      <Route element={<RequireAuth allowedRoles={['landlord']} />}>
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/landlord/listings" element={<LandlordListingsPage />} />
        <Route path="/landlord/messages" element={<LandlordMessagesPage />} />
        <Route path="/landlord/reports" element={<LandlordReportsPage />} />
        <Route path="/landlord/profile" element={<LandlordCompleteProfile />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<RequireAuth allowedRoles={['admin', 'superadmin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

export default App;

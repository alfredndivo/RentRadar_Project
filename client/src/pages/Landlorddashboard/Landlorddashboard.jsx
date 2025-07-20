import { useState } from 'react';
import { Menu, X, Home, User, LogOut, Mail, FileText, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', icon: <Home className="w-4 h-4" />, path: '/landlord/dashboard' },
  { name: 'Profile', icon: <User className="w-4 h-4" />, path: '/landlord/profile' },
  { name: 'Listings', icon: <FileText className="w-4 h-4" />, path: '/landlord/listings' },
  { name: 'Messages', icon: <Mail className="w-4 h-4" />, path: '/landlord/messages' },
  { name: 'Reviews', icon: <Flag className="w-4 h-4" />, path: '/landlord/reviews' },
  { name: 'Reports', icon: <Flag className="w-4 h-4" />, path: '/landlord/reports' },
];

const LandlordDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderMenu = () => (
    <>
      {menuItems.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-blue-100 text-gray-700 w-full"
        >
          {item.icon}
          {item.name}
        </button>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-red-100 text-red-600 w-full mt-4"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-white shadow-md p-4 space-y-2">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Landlord Panel</h2>
        {renderMenu()}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden p-2 w-full bg-white shadow-md flex justify-between items-center">
        <h2 className="text-lg font-semibold text-blue-600">Landlord Panel</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute z-10 left-0 top-14 w-full p-4 space-y-2">
          {renderMenu()}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4 text-blue-800">Welcome to your dashboard</h1>
        {/* You can slot in components like <LandlordOverview />, etc. here */}
        <div className="bg-white p-4 rounded-xl shadow border border-blue-100">
          <p className="text-gray-600">Dashboard content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;

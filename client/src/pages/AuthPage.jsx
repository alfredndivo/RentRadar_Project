import React, { useState } from 'react';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, Home } from 'lucide-react';
import {registerUser,
  loginUser,
  registerLandlord,
  loginLandlord,
  loginAdmin} from '../../api';
import { validateEmail, validatePhone, validatePassword } from '../utils/validation';
import DarkModeToggle from '../components/DarkModeToggle';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      if (!formData.name?.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid Kenyan phone number';
      }
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setFormData({});
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return alert('Please select a role first');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;

      if (isLogin) {
        if (role === 'user') {
          response = await loginUser(formData);
        } else if (role === 'landlord') {
          response = await loginLandlord(formData);
        } else if (role === 'admin') {
          response = await loginAdmin(formData);
        }
      } else {
        if (role === 'admin') {
          return alert('Admin registration is not allowed. Please contact system administrator.');
        } else if (role === 'user') {
          response = await registerUser(formData);
        } else if (role === 'landlord') {
          response = await registerLandlord(formData);
        }
      }

      const data = response.data;
      console.log('Auth response:', data);
      
      // Navigate based on role
      if (role === 'user' && data.user) {
        navigate('/user/dashboard');
      } else if (role === 'landlord' && data.landlord) {
        // Check if profile is complete
        const landlord = data.landlord;
        if (!landlord.idNumber || !landlord.location) {
          navigate('/landlord/profile');
        } else {
          navigate('/landlord/dashboard');
        }
      } else if (role === 'admin' && data.admin) {
        navigate('/admin/dashboard');
      }

    } catch (err) {
      console.error('Auth error:', err);
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DarkModeToggle />
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-overlay">
          <div className="auth-text-content">
            <h2 className="auth-main-text">Find verified homes with peace of mind.</h2>
            <p className="auth-sub-text">Join a growing community of trusted landlords and safe-seeking tenants.</p>
          </div>
        </div>
        <div className="slide-img img1"></div>
        <div className="slide-img img2"></div>
        <div className="slide-img img3"></div>
      </div>

      <div className="auth-card">
        <h2>Welcome to RentRadar</h2>

        <select value={role} onChange={handleRoleChange} className="auth-select">
          <option value="">-- Select Role --</option>
          <option value="user">Tenant</option>
          <option value="landlord">Landlord</option>
          {isLogin && <option value="admin">Admin</option>}
        </select>

        {role && (
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    onChange={handleInputChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="input-group">
                  <Phone className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    onChange={handleInputChange}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </>
            )}
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                onChange={handleInputChange}
                className={errors.password ? 'border-red-500' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {isLogin && <div className="auth-forgot">Forgot password?</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        )}

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={toggleAuthMode}>
            {isLogin ? ' Register' : ' Login'}
          </span>
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;
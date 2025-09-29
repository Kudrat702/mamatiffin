import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import FloatingBubblesFoodBackground from './FloatingBubbleBackground';
import { apiEndpoints } from '../configapi/api';

interface AddressOptions {
  district: string;
  blocks: string[];
  cities: string[];
  homeLodgeNames: string[];
}

export interface LocalUser{
  id: string;
  name: string;
  phone: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  role: string;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: LocalUser, token: string) => void;
}

const saveAuthToStorage = (user: LocalUser, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addressOptions, setAddressOptions] = useState<AddressOptions[]>([]);
  const [error, setError] = useState('');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    phone: '',
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    phone: '',
    password: '',
    address: {
      district: '',
      block: '',
      city: '',
      homeLodgeName: ''
    }
  });

  useEffect(() => {
    if (isOpen && activeTab === 'signup') {
      fetchAddressOptions();
    }
  }, [isOpen, activeTab]);

  const fetchAddressOptions = async () => {
    try {
      const response = await fetch(apiEndpoints.addressOptions);
      const result = await response.json();
      if (result.success) setAddressOptions(result.data);
    } catch {
      console.error('Error fetching address options');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiEndpoints.signin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signInData),
      });

      const result = await response.json();

      if (result.success && result.token && result.user) {
        saveAuthToStorage(result.user as LocalUser, String(result.token));
        onLoginSuccess(result.user, result.token);
        onClose();
        setSignInData({ phone: '', password: '' });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiEndpoints.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();

      if (result.success && result.token && result.user) {
        saveAuthToStorage(result.user as LocalUser, String(result.token));
        onLoginSuccess(result.user, result.token);
        onClose();
        setSignUpData({
          name: '',
          phone: '',
          password: '',
          address: { district: '', block: '', city: '', homeLodgeName: '' }
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOptions = (type: 'blocks' | 'cities' | 'homeLodgeNames') => {
    const selectedDistrict = signUpData.address.district;
    const districtData = addressOptions.find(addr => addr.district === selectedDistrict);
    return districtData ? districtData[type] : [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Full Screen Background */}
      <FloatingBubblesFoodBackground className="w-full h-full">
        {/* Enhanced Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/30 backdrop-blur-sm" />
        
        {/* Perfect Center Container */}
        <div className="absolute inset-0 flex items-center justify-center p-4 min-h-screen">
          {/* Modal Content - Enhanced Design */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20 z-10">
            {/* Modern Header with Gradient */}
            <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-t-3xl p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('signin')}
                    className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
                      activeTab === 'signin' 
                        ? 'scale-105' 
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      color: activeTab === 'signin' ? 'rgb(50, 140, 129)' : '#6b7280'
                    }}
                  >
                    Sign In
                    {activeTab === 'signin' && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                        style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
                      activeTab === 'signup' 
                        ? 'scale-105' 
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      color: activeTab === 'signup' ? 'rgb(50, 140, 129)' : '#6b7280'
                    }}
                  >
                    Sign Up
                    {activeTab === 'signup' && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                        style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                      />
                    )}
                  </button>
                </div>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-110"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Error Message - Enhanced */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl text-red-700 text-sm shadow-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Sign In Form - Enhanced */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    value={signInData.phone}
                    onChange={(e) => setSignInData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                      style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  style={{ 
                    backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)',
                  }}
                >
                  {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Sign Up Form - Enhanced */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                  <input
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Enhanced Address Section */}
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
                    <h3 className="text-lg font-bold text-gray-700">Address Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">District</label>
                      <select
                        value={signUpData.address.district}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          address: { ...prev.address, district: e.target.value, block: '', city: '', homeLodgeName: '' }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-sm bg-gray-50 hover:bg-white"
                        style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                        required
                      >
                        <option value="">Select District</option>
                        {addressOptions.map((addr) => (
                          <option key={addr.district} value={addr.district}>{addr.district}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">Block</label>
                      <select
                        value={signUpData.address.block}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          address: { ...prev.address, block: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                        required
                        disabled={!signUpData.address.district}
                      >
                        <option value="">Select Block</option>
                        {getFilteredOptions('blocks').map((block) => (
                          <option key={block} value={block}>{block}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">City</label>
                      <select
                        value={signUpData.address.city}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                        required
                        disabled={!signUpData.address.district}
                      >
                        <option value="">Select City</option>
                        {getFilteredOptions('cities').map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">Home/Lodge</label>
                      <select
                        value={signUpData.address.homeLodgeName}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          address: { ...prev.address, homeLodgeName: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                        required
                        disabled={!signUpData.address.district}
                      >
                        <option value="">Select Type</option>
                        {getFilteredOptions('homeLodgeNames').map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                      style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                      placeholder="Enter your password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Password must be at least 6 characters long</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  style={{ 
                    backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)',
                  }}
                >
                  {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </div>
        </div>
      </FloatingBubblesFoodBackground>
    </div>
  );
};

export default AuthModal;
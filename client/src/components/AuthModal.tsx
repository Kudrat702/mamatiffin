import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FloatingBubblesFoodBackground from './FloatingBubbleBackground';
import { apiEndpoints } from '../configapi/api';
import { useAuth } from '../context/AuthContext'; // ✅ CORRECT IMPORT

interface AddressOptions {
  district: string;
  blocks: string[];
  cities: string[];
  homeLodgeNames: string[];
}

export interface LocalUser {
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
  onLoginSuccess?: (user: LocalUser, token: string) => void; // Optional now
}

// Sign In Form Type
interface SignInFormData {
  phone: string;
  password: string;
}

// Sign Up Form Type
interface SignUpFormData {
  name: string;
  phone: string;
  password: string;
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuth(); // ✅ Use correct hook
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addressOptions, setAddressOptions] = useState<AddressOptions[]>([]);
  const [error, setError] = useState('');

  // React Hook Form for Sign In
  const { 
    register: registerSignIn, 
    handleSubmit: handleSubmitSignIn,
    reset: resetSignIn,
    formState: { errors: signInErrors }
  } = useForm<SignInFormData>({
    mode: 'onSubmit',
  });

  // React Hook Form for Sign Up
  const { 
    register: registerSignUp, 
    handleSubmit: handleSubmitSignUp,
    watch,
    reset: resetSignUp,
    formState: { errors: signUpErrors }
  } = useForm<SignUpFormData>({
    mode: 'onSubmit',
  });

  const selectedDistrict = watch('district');

  const filteredBlocks = useMemo(() => {
    if (!selectedDistrict) return [];
    const districtData = addressOptions.find(addr => addr.district === selectedDistrict);
    return districtData?.blocks || [];
  }, [selectedDistrict, addressOptions]);

  const filteredCities = useMemo(() => {
    if (!selectedDistrict) return [];
    const districtData = addressOptions.find(addr => addr.district === selectedDistrict);
    return districtData?.cities || [];
  }, [selectedDistrict, addressOptions]);

  const filteredHomeLodgeNames = useMemo(() => {
    if (!selectedDistrict) return [];
    const districtData = addressOptions.find(addr => addr.district === selectedDistrict);
    return districtData?.homeLodgeNames || [];
  }, [selectedDistrict, addressOptions]);

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

  // ✅ Updated Sign In - Use Context
  const onSignInSubmit = useCallback(async (data: SignInFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiEndpoints.signin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.token && result.user) {
        // ✅ Save to Context (automatically saves to localStorage)
        login(result.user, result.token);
        
        // Optional callback if parent needs to know
        if (onLoginSuccess) {
          onLoginSuccess(result.user, result.token);
        }
        
        onClose();
        resetSignIn();
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [login, onLoginSuccess, onClose, resetSignIn]);

  // ✅ Updated Sign Up - Use Context
  const onSignUpSubmit = useCallback(async (data: SignUpFormData) => {
    setLoading(true);
    setError('');

    const signUpPayload = {
      name: data.name,
      phone: data.phone,
      password: data.password,
      address: {
        district: data.district,
        block: data.block,
        city: data.city,
        homeLodgeName: data.homeLodgeName
      }
    };

    try {
      const response = await fetch(apiEndpoints.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpPayload),
      });

      const result = await response.json();

      if (result.success && result.token && result.user) {
        // ✅ Save to Context (automatically saves to localStorage)
        login(result.user, result.token);
        
        // Optional callback if parent needs to know
        if (onLoginSuccess) {
          onLoginSuccess(result.user, result.token);
        }
        
        onClose();
        resetSignUp();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [login, onLoginSuccess, onClose, resetSignUp]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <FloatingBubblesFoodBackground className="w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/30 backdrop-blur-sm" />
        
        <div className="absolute inset-0 flex items-center justify-center p-4 min-h-screen">
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20 z-10">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-t-3xl p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('signin')}
                    className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
                      activeTab === 'signin' ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={{ color: activeTab === 'signin' ? 'rgb(50, 140, 129)' : '#6b7280' }}
                  >
                    Sign In
                    {activeTab === 'signin' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }} />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
                      activeTab === 'signup' ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={{ color: activeTab === 'signup' ? 'rgb(50, 140, 129)' : '#6b7280' }}
                  >
                    Sign Up
                    {activeTab === 'signup' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }} />
                    )}
                  </button>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-110">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl text-red-700 text-sm shadow-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSubmitSignIn(onSignInSubmit)} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    {...registerSignIn('phone', { required: 'Phone number is required' })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                  {signInErrors.phone && <p className="text-red-500 text-xs mt-1">{signInErrors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...registerSignIn('password', { required: 'Password is required' })}
                      className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  {signInErrors.password && <p className="text-red-500 text-xs mt-1">{signInErrors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  style={{ backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)' }}
                >
                  {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                  <input
                    type="text"
                    {...registerSignUp('name', { required: 'Name is required' })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  {signUpErrors.name && <p className="text-red-500 text-xs mt-1">{signUpErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    {...registerSignUp('phone', { required: 'Phone number is required' })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                  {signUpErrors.phone && <p className="text-red-500 text-xs mt-1">{signUpErrors.phone.message}</p>}
                </div>

                {/* Address Section */}
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
                    <h3 className="text-lg font-bold text-gray-700">Address Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">District</label>
                      <select
                        {...registerSignUp('district', { required: 'District is required' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 hover:bg-white"
                      >
                        <option value="">Select District</option>
                        {addressOptions.map((addr) => (
                          <option key={addr.district} value={addr.district}>{addr.district}</option>
                        ))}
                      </select>
                      {signUpErrors.district && <p className="text-red-500 text-xs mt-1">{signUpErrors.district.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">Block</label>
                      <select
                        {...registerSignUp('block', { required: 'Block is required' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        disabled={!selectedDistrict}
                      >
                        <option value="">Select Block</option>
                        {filteredBlocks.map((block) => (
                          <option key={block} value={block}>{block}</option>
                        ))}
                      </select>
                      {signUpErrors.block && <p className="text-red-500 text-xs mt-1">{signUpErrors.block.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">City</label>
                      <select
                        {...registerSignUp('city', { required: 'City is required' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        disabled={!selectedDistrict}
                      >
                        <option value="">Select City</option>
                        {filteredCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {signUpErrors.city && <p className="text-red-500 text-xs mt-1">{signUpErrors.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">Home/Lodge</label>
                      <select
                        {...registerSignUp('homeLodgeName', { required: 'Home/Lodge is required' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
                        disabled={!selectedDistrict}
                      >
                        <option value="">Select Type</option>
                        {filteredHomeLodgeNames.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      {signUpErrors.homeLodgeName && <p className="text-red-500 text-xs mt-1">{signUpErrors.homeLodgeName.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...registerSignUp('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  {signUpErrors.password && <p className="text-red-500 text-xs mt-1">{signUpErrors.password.message}</p>}
                  <p className="text-xs text-gray-500 mt-2 font-medium">Password must be at least 6 characters long</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  style={{ backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)' }}
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
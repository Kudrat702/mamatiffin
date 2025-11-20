// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import FloatingBubblesFoodBackground from './FloatingBubbleBackground';
// import { apiEndpoints } from '../configapi/api';
// import { useAuth } from '../context/AuthContext';

// interface AddressOptions {
//   district: string;
//   blocks: string[];
//   cities: string[];
//   homeLodgeNames: string[];
// }

// export interface LocalUser {
//   id: string;
//   name: string;
//   phone: string;
//   address: {
//     district: string;
//     block: string;
//     city: string;
//     homeLodgeName: string;
//   };
//   role: string;
// }

// export interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onLoginSuccess?: (user: LocalUser, token: string) => void;
// }

// interface SignInFormData {
//   phone: string;
//   password: string;
// }

// interface SignUpFormData {
//   name: string;
//   phone: string;
//   password: string;
//   district: string;
//   block: string;
//   city: string;
//   homeLodgeName: string;
// }

// // ✅ Optimized Select Component with React.memo
// const OptimizedSelect = React.memo<{
//   label: string;
//   options: string[];
//   register: any;
//   name: string;
//   error?: string;
//   disabled?: boolean;
//   placeholder: string;
// }>(({ label, options, register, name, error, disabled, placeholder }) => (
//   <div>
//     <label className="block text-xs font-bold text-gray-600 mb-2">{label}</label>
//     <select
//       {...register}
//       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 hover:bg-white disabled:opacity-50"
//       disabled={disabled}
//     >
//       <option value="">{placeholder}</option>
//       {options.map((option) => (
//         <option key={option} value={option}>{option}</option>
//       ))}
//     </select>
//     {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//   </div>
// ));

// OptimizedSelect.displayName = 'OptimizedSelect';

// const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
//   const { login } = useAuth();
//   const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [addressOptions, setAddressOptions] = useState<AddressOptions[]>([]);
//   const [error, setError] = useState('');

//   const { 
//     register: registerSignIn, 
//     handleSubmit: handleSubmitSignIn,
//     reset: resetSignIn,
//     formState: { errors: signInErrors }
//   } = useForm<SignInFormData>({
//     mode: 'onSubmit',
//   });

//   const { 
//     register: registerSignUp, 
//     handleSubmit: handleSubmitSignUp,
//     watch,
//     reset: resetSignUp,
//     formState: { errors: signUpErrors }
//   } = useForm<SignUpFormData>({
//     mode: 'onSubmit',
//   });

//   const selectedDistrict = watch('district');

//   // ✅ SINGLE OPTIMIZED useMemo - Teen ko ek mein combine kiya
//   const filteredAddressData = useMemo(() => {
//     if (!selectedDistrict) {
//       return {
//         blocks: [],
//         cities: [],
//         homeLodgeNames: [],
//         districts: addressOptions.map(addr => addr.district)
//       };
//     }
    
//     const districtData = addressOptions.find(addr => addr.district === selectedDistrict);
    
//     return {
//       blocks: districtData?.blocks || [],
//       cities: districtData?.cities || [],
//       homeLodgeNames: districtData?.homeLodgeNames || [],
//       districts: addressOptions.map(addr => addr.district)
//     };
//   }, [selectedDistrict, addressOptions]);

//   // ✅ Only fetch once when modal opens
//   useEffect(() => {
//     if (isOpen && activeTab === 'signup' && addressOptions.length === 0) {
//       fetchAddressOptions();
//     }
//   }, [isOpen, activeTab, addressOptions.length]);

//   const fetchAddressOptions = useCallback(async () => {
//     try {
//       const response = await fetch(apiEndpoints.addressOptions);
//       const result = await response.json();
//       if (result.success) setAddressOptions(result.data);
//     } catch {
//       console.error('Error fetching address options');
//     }
//   }, []);

//   const onSignInSubmit = useCallback(async (data: SignInFormData) => {
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(apiEndpoints.signin, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       const result = await response.json();

//       if (result.success && result.token && result.user) {
//         login(result.user, result.token);
        
//         if (onLoginSuccess) {
//           onLoginSuccess(result.user, result.token);
//         }
        
//         onClose();
//         resetSignIn();
//       } else {
//         setError(result.message || 'Login failed');
//       }
//     } catch {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [login, onLoginSuccess, onClose, resetSignIn]);

//   const onSignUpSubmit = useCallback(async (data: SignUpFormData) => {
//     setLoading(true);
//     setError('');

//     const signUpPayload = {
//       name: data.name,
//       phone: data.phone,
//       password: data.password,
//       address: {
//         district: data.district,
//         block: data.block,
//         city: data.city,
//         homeLodgeName: data.homeLodgeName
//       }
//     };

//     try {
//       const response = await fetch(apiEndpoints.signup, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(signUpPayload),
//       });

//       const result = await response.json();

//       if (result.success && result.token && result.user) {
//         login(result.user, result.token);
        
//         if (onLoginSuccess) {
//           onLoginSuccess(result.user, result.token);
//         }
        
//         onClose();
//         resetSignUp();
//       } else {
//         setError(result.message || 'Registration failed');
//       }
//     } catch {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [login, onLoginSuccess, onClose, resetSignUp]);

//   const togglePassword = useCallback(() => {
//     setShowPassword(prev => !prev);
//   }, []);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50">
//       <FloatingBubblesFoodBackground className="w-full h-full">
//         <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/30 backdrop-blur-sm" />
        
//         <div className="absolute inset-0 flex items-center justify-center p-4 min-h-screen">
//           <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20 z-10">
//             {/* Header */}
//             <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-t-3xl p-8 border-b border-gray-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex space-x-8">
//                   <button
//                     onClick={() => setActiveTab('signin')}
//                     className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
//                       activeTab === 'signin' ? 'scale-105' : 'hover:scale-105'
//                     }`}
//                     style={{ color: activeTab === 'signin' ? 'rgb(50, 140, 129)' : '#6b7280' }}
//                   >
//                     Sign In
//                     {activeTab === 'signin' && (
//                       <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }} />
//                     )}
//                   </button>
//                   <button
//                     onClick={() => setActiveTab('signup')}
//                     className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
//                       activeTab === 'signup' ? 'scale-105' : 'hover:scale-105'
//                     }`}
//                     style={{ color: activeTab === 'signup' ? 'rgb(50, 140, 129)' : '#6b7280' }}
//                   >
//                     Sign Up
//                     {activeTab === 'signup' && (
//                       <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }} />
//                     )}
//                   </button>
//                 </div>
//                 <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-110">
//                   <X size={24} />
//                 </button>
//               </div>
//             </div>

//             {/* Error Message */}
//             {error && (
//               <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl text-red-700 text-sm shadow-sm">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
//                   <span className="font-medium">{error}</span>
//                 </div>
//               </div>
//             )}

//             {/* Sign In Form */}
//             {activeTab === 'signin' && (
//               <form onSubmit={handleSubmitSignIn(onSignInSubmit)} className="p-8 space-y-6">
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
//                   <input
//                     type="tel"
//                     {...registerSignIn('phone', { required: 'Phone number is required' })}
//                     className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
//                     placeholder="Enter your phone number"
//                     autoComplete="tel"
//                   />
//                   {signInErrors.phone && <p className="text-red-500 text-xs mt-1">{signInErrors.phone.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       {...registerSignIn('password', { required: 'Password is required' })}
//                       className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
//                       placeholder="Enter your password"
//                       autoComplete="current-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={togglePassword}
//                       className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
//                     >
//                       {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                     </button>
//                   </div>
//                   {signInErrors.password && <p className="text-red-500 text-xs mt-1">{signInErrors.password.message}</p>}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
//                   style={{ backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)' }}
//                 >
//                   {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
//                   {loading ? 'Signing In...' : 'Sign In'}
//                 </button>
//               </form>
//             )}

//             {/* Sign Up Form */}
//             {activeTab === 'signup' && (
//               <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="p-8 space-y-6">
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
//                   <input
//                     type="text"
//                     {...registerSignUp('name', { required: 'Name is required' })}
//                     className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
//                     placeholder="Enter your full name"
//                     autoComplete="name"
//                   />
//                   {signUpErrors.name && <p className="text-red-500 text-xs mt-1">{signUpErrors.name.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
//                   <input
//                     type="tel"
//                     {...registerSignUp('phone', { required: 'Phone number is required' })}
//                     className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
//                     placeholder="Enter your phone number"
//                     autoComplete="tel"
//                   />
//                   {signUpErrors.phone && <p className="text-red-500 text-xs mt-1">{signUpErrors.phone.message}</p>}
//                 </div>

//                 {/* ✅ OPTIMIZED Address Section */}
//                 <div className="space-y-5">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
//                     <h3 className="text-lg font-bold text-gray-700">Address Details</h3>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <OptimizedSelect
//                       label="District"
//                       options={filteredAddressData.districts}
//                       register={registerSignUp('district', { required: 'District is required' })}
//                       name="district"
//                       error={signUpErrors.district?.message}
//                       placeholder="Select District"
//                       disabled={false}
//                     />

//                     <OptimizedSelect
//                       label="Block"
//                       options={filteredAddressData.blocks}
//                       register={registerSignUp('block', { required: 'Block is required' })}
//                       name="block"
//                       error={signUpErrors.block?.message}
//                       placeholder="Select Block"
//                       disabled={!selectedDistrict}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <OptimizedSelect
//                       label="City"
//                       options={filteredAddressData.cities}
//                       register={registerSignUp('city', { required: 'City is required' })}
//                       name="city"
//                       error={signUpErrors.city?.message}
//                       placeholder="Select City"
//                       disabled={!selectedDistrict}
//                     />

//                     <OptimizedSelect
//                       label="Home/Lodge"
//                       options={filteredAddressData.homeLodgeNames}
//                       register={registerSignUp('homeLodgeName', { required: 'Home/Lodge is required' })}
//                       name="homeLodgeName"
//                       error={signUpErrors.homeLodgeName?.message}
//                       placeholder="Select Type"
//                       disabled={!selectedDistrict}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-3">Password</label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       {...registerSignUp('password', { 
//                         required: 'Password is required',
//                         minLength: { value: 6, message: 'Password must be at least 6 characters' }
//                       })}
//                       className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(50,140,129)] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
//                       placeholder="Enter your password"
//                       autoComplete="new-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={togglePassword}
//                       className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
//                     >
//                       {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                     </button>
//                   </div>
//                   {signUpErrors.password && <p className="text-red-500 text-xs mt-1">{signUpErrors.password.message}</p>}
//                   <p className="text-xs text-gray-500 mt-2 font-medium">Password must be at least 6 characters long</p>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
//                   style={{ backgroundColor: loading ? '#9ca3af' : 'rgb(50, 140, 129)' }}
//                 >
//                   {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
//                   {loading ? 'Creating Account...' : 'Sign Up'}
//                 </button>
//               </form>
//             )}
//           </div>
//         </div>
//       </FloatingBubblesFoodBackground>
//     </div>
//   );
// };

// export default AuthModal;

import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import FloatingBubblesFoodBackground from './FloatingBubbleBackground';
import { apiEndpoints } from '../configapi/api';
import { useAuth } from '../context/AuthContext';

// ============================================
// INTERFACES
// ============================================
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
  onLoginSuccess?: (user: LocalUser, token: string) => void;
}

// ============================================
// MEMOIZED BACKGROUND COMPONENT
// ============================================
const MemoizedBackground = React.memo(
  () => <FloatingBubblesFoodBackground />,
  () => true // Never re-render
);
MemoizedBackground.displayName = 'MemoizedBackground';

// ============================================
// MAIN COMPONENT
// ============================================
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Address data
  const [addressOptions, setAddressOptions] = useState<AddressOptions[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [homeLodgeNames, setHomeLodgeNames] = useState<string[]>([]);

  // ============================================
  // SIGN IN FORM STATE (Simple useState)
  // ============================================
  const [signInData, setSignInData] = useState({
    phone: '',
    password: '',
  });

  const [signInErrors, setSignInErrors] = useState({
    phone: '',
    password: '',
  });

  // ============================================
  // SIGN UP FORM STATE (Simple useState)
  // ============================================
  const [signUpData, setSignUpData] = useState({
    name: '',
    phone: '',
    password: '',
    district: '',
    block: '',
    city: '',
    homeLodgeName: '',
  });

  const [signUpErrors, setSignUpErrors] = useState({
    name: '',
    phone: '',
    password: '',
    district: '',
    block: '',
    city: '',
    homeLodgeName: '',
  });

  // ============================================
  // FETCH ADDRESS OPTIONS (Only once)
  // ============================================
  useEffect(() => {
    if (isOpen && activeTab === 'signup' && addressOptions.length === 0) {
      fetchAddressOptions();
    }
  }, [isOpen, activeTab]);

  const fetchAddressOptions = async () => {
    try {
      const response = await fetch(apiEndpoints.addressOptions);
      const result = await response.json();
      if (result.success && result.data) {
        setAddressOptions(result.data);
        setDistricts(result.data.map((addr: AddressOptions) => addr.district));
      }
    } catch (error) {
      console.error('Error fetching address options:', error);
    }
  };

  // ============================================
  // UPDATE BLOCKS, CITIES, HOMES when district changes
  // ============================================
  useEffect(() => {
    if (signUpData.district) {
      const selectedDistrictData = addressOptions.find(
        (addr) => addr.district === signUpData.district
      );

      if (selectedDistrictData) {
        setBlocks(selectedDistrictData.blocks || []);
        setCities(selectedDistrictData.cities || []);
        setHomeLodgeNames(selectedDistrictData.homeLodgeNames || []);
      }

      // Reset dependent fields
      setSignUpData((prev) => ({
        ...prev,
        block: '',
        city: '',
        homeLodgeName: '',
      }));
    } else {
      setBlocks([]);
      setCities([]);
      setHomeLodgeNames([]);
    }
  }, [signUpData.district, addressOptions]);

  // ============================================
  // SIGN IN HANDLERS
  // ============================================
  const handleSignInChange = (field: 'phone' | 'password', value: string) => {
    setSignInData((prev) => ({ ...prev, [field]: value }));
    setSignInErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validateSignIn = (): boolean => {
    const errors = { phone: '', password: '' };
    let isValid = true;

    if (!signInData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(signInData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!signInData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setSignInErrors(errors);
    return isValid;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignIn()) return;

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
        login(result.user, result.token);
        if (onLoginSuccess) {
          onLoginSuccess(result.user, result.token);
        }
        onClose();
        // Reset form
        setSignInData({ phone: '', password: '' });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SIGN UP HANDLERS
  // ============================================
  const handleSignUpChange = (field: keyof typeof signUpData, value: string) => {
    setSignUpData((prev) => ({ ...prev, [field]: value }));
    setSignUpErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validateSignUp = (): boolean => {
    const errors = {
      name: '',
      phone: '',
      password: '',
      district: '',
      block: '',
      city: '',
      homeLodgeName: '',
    };
    let isValid = true;

    if (!signUpData.name) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (signUpData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!signUpData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(signUpData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!signUpData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (signUpData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!signUpData.district) {
      errors.district = 'District is required';
      isValid = false;
    }

    if (!signUpData.block) {
      errors.block = 'Block is required';
      isValid = false;
    }

    if (!signUpData.city) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!signUpData.homeLodgeName) {
      errors.homeLodgeName = 'Home/Lodge name is required';
      isValid = false;
    }

    setSignUpErrors(errors);
    return isValid;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUp()) return;

    setLoading(true);
    setError('');

    const signUpPayload = {
      name: signUpData.name,
      phone: signUpData.phone,
      password: signUpData.password,
      address: {
        district: signUpData.district,
        block: signUpData.block,
        city: signUpData.city,
        homeLodgeName: signUpData.homeLodgeName,
      },
    };

    try {
      const response = await fetch(apiEndpoints.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpPayload),
      });

      const result = await response.json();

      if (result.success && result.token && result.user) {
        login(result.user, result.token);
        if (onLoginSuccess) {
          onLoginSuccess(result.user, result.token);
        }
        onClose();
        // Reset form
        setSignUpData({
          name: '',
          phone: '',
          password: '',
          district: '',
          block: '',
          city: '',
          homeLodgeName: '',
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TOGGLE PASSWORD VISIBILITY
  // ============================================
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Background - renders only once */}
      <MemoizedBackground />

      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={24} style={{ color: 'rgb(50, 140, 129)' }} />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
          <div className="p-8">
            {/* TABS */}
            <div className="flex justify-center gap-8 mb-8 border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab('signin')}
                className={`text-xl font-bold pb-3 transition-all duration-300 relative ${
                  activeTab === 'signin' ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{ color: activeTab === 'signin' ? 'rgb(50, 140, 129)' : '#6b7280' }}
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
                  activeTab === 'signup' ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{ color: activeTab === 'signup' ? 'rgb(50, 140, 129)' : '#6b7280' }}
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

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* ============================================ */}
            {/* SIGN IN FORM */}
            {/* ============================================ */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-5">
                {/* Phone Number */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'rgb(50, 140, 129)' }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signInData.phone}
                    onChange={(e) => handleSignInChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    placeholder="Enter your phone number"
                    style={{ borderColor: 'rgb(50, 140, 129)' }}
                    maxLength={10}
                  />
                  {signInErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{signInErrors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'rgb(50, 140, 129)' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInData.password}
                      onChange={(e) => handleSignInChange('password', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-12"
                      placeholder="Enter your password"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {signInErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{signInErrors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* ============================================ */}
            {/* SIGN UP FORM */}
            {/* ============================================ */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'rgb(50, 140, 129)' }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => handleSignUpChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    placeholder="Enter your full name"
                    style={{ borderColor: 'rgb(50, 140, 129)' }}
                  />
                  {signUpErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{signUpErrors.name}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'rgb(50, 140, 129)' }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => handleSignUpChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    placeholder="Enter your phone number"
                    style={{ borderColor: 'rgb(50, 140, 129)' }}
                    maxLength={10}
                  />
                  {signUpErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{signUpErrors.phone}</p>
                  )}
                </div>

                {/* ADDRESS SECTION */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold" style={{ color: 'rgb(50, 140, 129)' }}>
                    Address Details
                  </h3>

                  {/* District */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: 'rgb(50, 140, 129)' }}
                    >
                      District
                    </label>
                    <select
                      value={signUpData.district}
                      onChange={(e) => handleSignUpChange('district', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {signUpErrors.district && (
                      <p className="text-red-500 text-sm mt-1">{signUpErrors.district}</p>
                    )}
                  </div>

                  {/* Block */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: 'rgb(50, 140, 129)' }}
                    >
                      Block
                    </label>
                    <select
                      value={signUpData.block}
                      onChange={(e) => handleSignUpChange('block', e.target.value)}
                      disabled={!signUpData.district}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    >
                      <option value="">Select Block</option>
                      {blocks.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                    {signUpErrors.block && (
                      <p className="text-red-500 text-sm mt-1">{signUpErrors.block}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: 'rgb(50, 140, 129)' }}
                    >
                      City
                    </label>
                    <select
                      value={signUpData.city}
                      onChange={(e) => handleSignUpChange('city', e.target.value)}
                      disabled={!signUpData.district}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {signUpErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{signUpErrors.city}</p>
                    )}
                  </div>

                  {/* Home/Lodge Name */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: 'rgb(50, 140, 129)' }}
                    >
                      Home/Lodge Name
                    </label>
                    <select
                      value={signUpData.homeLodgeName}
                      onChange={(e) => handleSignUpChange('homeLodgeName', e.target.value)}
                      disabled={!signUpData.district}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    >
                      <option value="">Select Home/Lodge</option>
                      {homeLodgeNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {signUpErrors.homeLodgeName && (
                      <p className="text-red-500 text-sm mt-1">{signUpErrors.homeLodgeName}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'rgb(50, 140, 129)' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpData.password}
                      onChange={(e) => handleSignUpChange('password', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-12"
                      placeholder="Create a password"
                      style={{ borderColor: 'rgb(50, 140, 129)' }}
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {signUpErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{signUpErrors.password}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
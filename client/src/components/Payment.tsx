// components/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  MapPin,
  CreditCard,
  XCircle,
  AlertCircle,
  Loader,
  Shield,
  CheckCircle
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';
//import { apiEndpoints } from '../../services/paymentApi';

interface Address {
  district?: string;
  block?: string;
  city: string;
  homeLodgeName: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: Address;
  city: string;
}

interface WeeklyMenu {
  [key: string]: string[] | undefined;
}

interface PaymentData {
  menuId: string;
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  price: number;
  totalAmount: number;
  duration: number;
  subscriptionType: 'monthly' | 'trial';
  deliveryTime?: string;
  description?: string;
  imageUrl?: string;
  weeklyMenu?: WeeklyMenu;
  customerInfo?: CustomerInfo;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  config: {
    display: {
      blocks: {
        banks: {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: RazorpayError) => void): void;
}

interface PaymentOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
    dbOrderId: string;
    key_id: string;
    actualPrice: number;
    menuDetails: {
      title: string;
      dietaryPreference: string;
      deliveryTime: string;
    };
  };
  message?: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    paymentStatus: string;
    orderId: string;
    paymentId: string;
    orderDetails: Record<string, unknown>;
  };
}

// Declare Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    block: '',
    city: '',
    homeLodgeName: ''
  });

  useEffect(() => {
    // Get payment data from location state or sessionStorage
    let data = location.state as PaymentData;
    
    if (!data) {
      // Try to get from sessionStorage (after login redirect)
      const redirectData = sessionStorage.getItem('redirectAfterLogin');
      if (redirectData) {
        const parsed = JSON.parse(redirectData) as { menuData: PaymentData };
        data = parsed.menuData;
        sessionStorage.removeItem('redirectAfterLogin');
      }
    }

    if (!data || !data.menuId) {
      setError('Payment data not found. Please go back and try again.');
      return;
    }

    setPaymentData(data);

    // Pre-fill customer info if available
    if (data.customerInfo) {
      setCustomerInfo({
        name: data.customerInfo.name || '',
        phone: data.customerInfo.phone || '',
        email: data.customerInfo.email || '',
        district: data.customerInfo.address?.district || '',
        block: data.customerInfo.address?.block || '',
        city: data.customerInfo.city || data.customerInfo.address?.city || '',
        homeLodgeName: data.customerInfo.address?.homeLodgeName || ''
      });
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Type guard to ensure name is not undefined
    if (!name) return;

    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!customerInfo.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!customerInfo.phone.trim() || !/^[6-9]\d{9}$/.test(customerInfo.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!customerInfo.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!customerInfo.homeLodgeName.trim()) {
      setError('Please enter your home/lodge name');
      return false;
    }
    return true;
  };

  const createPaymentOrder = async (): Promise<PaymentOrderResponse['data']> => {
    try {
      if (!paymentData) {
        throw new Error('Payment data not available');
      }
      // 👇 Add this line here to log the endpoint being hit
    console.log('Hitting:', apiEndpoints.createPayment);
      const response = await fetch(apiEndpoints.createPayment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuId: paymentData.menuId,
          menuTitle: paymentData.menuTitle,
          menuCategory: paymentData.menuCategory,
          dietaryPreference: paymentData.dietaryPreference,
          subscriptionType: paymentData.subscriptionType,
          duration: paymentData.duration,
          totalAmount: paymentData.totalAmount,
          deliveryTime: paymentData.deliveryTime,
          description: paymentData.description,
          imageUrl: paymentData.imageUrl,
          weeklyMenu: paymentData.weeklyMenu,
          startDate: new Date().toISOString(),
          customerInfo: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: {
              district: customerInfo.district,
              block: customerInfo.block,
              city: customerInfo.city,
              homeLodgeName: customerInfo.homeLodgeName
            },
            city: customerInfo.city
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const data = await response.json() as PaymentOrderResponse;
      return data.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentResponse: RazorpayResponse, dbOrderId: string): Promise<PaymentVerificationResponse> => {
    try {
      const response = await fetch(apiEndpoints.verifyPayment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          dbOrderId: dbOrderId
        })
      });

      const data = await response.json() as PaymentVerificationResponse;
      return data;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      setError(null);
      
      if (!validateForm()) {
        return;
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh and try again.');
      }

      setLoading(true);
      setPaymentStatus('processing');

      // Create order
      const orderData = await createPaymentOrder();
      
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Mamatiffin',
        description: paymentData?.menuTitle || 'Food Subscription',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment
            const verificationResult = await verifyPayment(response, orderData.dbOrderId);
            
            if (verificationResult.success) {
              // Redirect to success page with payment details
              navigate(`/payment/success?orderId=${orderData.dbOrderId}&paymentId=${response.razorpay_payment_id}`);
            } else {
              throw new Error(verificationResult.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            setError(error instanceof Error ? error.message : 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
            setPaymentStatus('idle');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay via UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        theme: {
          color: '#328c81'
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: RazorpayError) => {
        console.error('Payment failed:', response);
        setPaymentStatus('failed');
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate payment');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-[#328c81] hover:bg-[#2a7568] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Payment Failed Screen
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[#328c81] mb-4">Payment Failed</h2>
          <p className="text-gray-600 mb-2">
            Unfortunately, your payment could not be processed.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setError(null);
              }}
              className="bg-[#328c81] hover:bg-[#2a7568] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="mr-4 p-3 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#328c81] to-[#2a7568] bg-clip-text text-transparent mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#328c81]" />
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#328c81] mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Order Summary
            </h2>
            
            {paymentData && (
              <>
                {/* Menu Image */}
                <div className="relative h-56 rounded-xl overflow-hidden mb-6 group">
                  <img
                    src={paymentData.imageUrl?.startsWith('http') 
                      ? paymentData.imageUrl 
                      : apiEndpoints.getImageUrl(paymentData.imageUrl || '')}
                    alt={paymentData.menuTitle}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Menu+Image';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                      paymentData.dietaryPreference === 'veg' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {paymentData.dietaryPreference === 'veg' ? '🥬 VEG' : '🍗 NON-VEG'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Order Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{paymentData.menuTitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{paymentData.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-[#328c81]/10 to-[#2a7568]/10 p-4 rounded-xl border border-[#328c81]/20">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#328c81]" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-[#328c81] font-semibold">
                            {paymentData.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery</p>
                          <p className="text-green-600 font-semibold">{paymentData.deliveryTime || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {paymentData.subscriptionType === 'trial' ? 'Trial Price' : 'Monthly Price'}
                      </span>
                      <span className="text-xl font-bold text-gray-900">₹{paymentData.price}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#328c81]">Total Amount</span>
                        <span className="text-2xl font-bold text-[#328c81]">₹{paymentData.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer Information Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#328c81] mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              Customer Information
            </h2>
            
            <form className="space-y-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-[#328c81]" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-[#328c81]" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={customerInfo.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                    placeholder="District"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Block
                  </label>
                  <input
                    type="text"
                    name="block"
                    value={customerInfo.block}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                    placeholder="Block"
                  />
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-[#328c81]" />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                  placeholder="Your city"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Home/Lodge Name *
                </label>
                <input
                  type="text"
                  name="homeLodgeName"
                  value={customerInfo.homeLodgeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#328c81] focus:border-[#328c81] transition-all duration-200 group-hover:border-gray-300"
                  placeholder="Home address or Lodge/PG name"
                  required
                />
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-pulse">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full mt-8 bg-gradient-to-r from-[#328c81] to-[#2a7568] hover:from-[#2a7568] hover:to-[#1f5a52] disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  <IndianRupee className="w-6 h-6" />
                  <span className="text-lg font-bold">Pay ₹{paymentData?.totalAmount || 0}</span>
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#328c81]/10 to-[#2a7568]/10 rounded-xl border border-[#328c81]/20 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-[#328c81] font-semibold mb-1">
                <Shield className="w-4 h-4" />
                Secure Payment by Razorpay
              </div>
              <p className="text-xs text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
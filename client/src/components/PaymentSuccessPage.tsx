// components/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  IndianRupee, 
  Clock, 
  User, 
  ArrowRight,
  Download,
  Share2,
  Home
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

interface PaymentDetails {
  orderId: string;
  paymentId: string;
  menuTitle: string;
  subscriptionType: 'monthly' | 'trial';
  totalAmount: number;
  customerName: string;
  startDate: string;
  endDate: string;
  dietaryPreference: string;
  deliveryTime: string;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Get payment details from URL parameters
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    if (orderId && paymentId) {
      fetchPaymentDetails(orderId);
    } else {
      // If no proper parameters, redirect after a short delay
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Countdown timer for auto redirect
  useEffect(() => {
    if (paymentDetails && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate('/user/dashboard');
    }
  }, [countdown, paymentDetails, navigate]);

  const fetchPaymentDetails = async (orderId: string) => {
    try {
      const response = await fetch(apiEndpoints.paymentStatus(orderId));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPaymentDetails({
            orderId: orderId,
            paymentId: searchParams.get('paymentId') || '',
            menuTitle: data.data.orderDetails.menuTitle,
            subscriptionType: data.data.orderDetails.subscriptionType,
            totalAmount: data.data.orderDetails.totalAmount,
            customerName: data.data.orderDetails.customerName,
            startDate: data.data.orderDetails.startDate,
            endDate: data.data.orderDetails.endDate,
            dietaryPreference: data.data.orderDetails.dietaryPreference || 'veg',
            deliveryTime: data.data.orderDetails.deliveryTime || 'Standard'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGoToDashboard = () => {
    navigate('/user/dashboard');
  };


  const handleDownloadReceipt = () => {
    // Create a simple receipt download
    const receiptContent = `
FOOD DELIVERY SERVICE - PAYMENT RECEIPT
=====================================

Order ID: ${paymentDetails?.orderId}
Payment ID: ${paymentDetails?.paymentId}
Customer: ${paymentDetails?.customerName}
Menu: ${paymentDetails?.menuTitle}
Amount Paid: ₹${paymentDetails?.totalAmount}
Subscription: ${paymentDetails?.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}
Start Date: ${paymentDetails?.startDate ? formatDate(paymentDetails.startDate) : 'N/A'}
End Date: ${paymentDetails?.endDate ? formatDate(paymentDetails.endDate) : 'N/A'}

Thank you for your order!
    `;

    const element = document.createElement('a');
    const file = new Blob([receiptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${paymentDetails?.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareSuccess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Food Delivery Order Confirmed!',
          text: `I just subscribed to ${paymentDetails?.menuTitle} for ₹${paymentDetails?.totalAmount}. Order ID: ${paymentDetails?.orderId}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `Food Delivery Order Confirmed! Menu: ${paymentDetails?.menuTitle}, Amount: ₹${paymentDetails?.totalAmount}, Order ID: ${paymentDetails?.orderId}`
      );
      alert('Order details copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Thank you for your order. Your subscription is now active.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {paymentDetails ? (
            <>
              {/* Order Summary */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Confirmation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-semibold">{paymentDetails.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Subscription Type</p>
                        <p className="font-semibold">
                          {paymentDetails.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Delivery Time</p>
                        <p className="font-semibold">{paymentDetails.deliveryTime}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <IndianRupee className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Amount Paid</p>
                        <p className="font-semibold text-green-600 text-xl">₹{paymentDetails.totalAmount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        paymentDetails.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <div>
                        <p className="text-sm text-gray-500">Menu Type</p>
                        <p className="font-semibold">{paymentDetails.menuTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Period */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Period</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(paymentDetails.startDate)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(paymentDetails.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{paymentDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{paymentDetails.paymentId}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Payment confirmed! Your order is being processed.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleGoToDashboard}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>
          
          <button
            onClick={handleShareSuccess}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Auto-redirect notification */}
        {paymentDetails && countdown > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              Automatically redirecting to dashboard in {countdown} seconds...
              <button 
                onClick={() => setCountdown(0)} 
                className="ml-2 underline hover:no-underline"
              >
                Skip
              </button>
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 mt-6">
          <p>You will receive a confirmation message shortly.</p>
          <p>For any queries, contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
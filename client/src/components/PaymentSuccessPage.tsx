import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  IndianRupee,
  Clock,
  User,
  ArrowRight,
  Download,
  ShoppingBag,
  Home,
  MapPin,
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

interface PaymentDetails {
  orderId: string;
  paymentId: string;
  menuTitle: string;
  subscriptionType: 'monthly' | 'trial' | 'weekly';
  totalAmount: number;
  customerName: string;
  customerPhone?: string;
  address?: {
    city?: string;
    homeLodgeName?: string;
  };
  startDate: string;
  endDate: string;
  dietaryPreference: string;
  deliveryTime: string;
}

const getSubscriptionLabel = (type: PaymentDetails['subscriptionType']) => {
  if (type === 'trial') return '1 Day Trial';
  if (type === 'weekly') return '7 Days Weekly Plan';
  return 'Monthly Plan (30 Days)';
};

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (orderId && paymentId) {
      fetchPaymentDetails(orderId, paymentId);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) navigate('/my-orders');
  }, [countdown, loading, navigate]);

  const fetchPaymentDetails = async (orderId: string, paymentId: string) => {
    try {
      const response = await fetch(apiEndpoints.paymentStatus(orderId));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.orderDetails) {
          const d = data.data.orderDetails;
          setPaymentDetails({
            orderId,
            paymentId,
            menuTitle: d.menuTitle || 'Tiffin Plan',
            subscriptionType: d.subscriptionType || 'monthly',
            totalAmount: d.totalAmount || 0,
            customerName: d.customerName || '',
            customerPhone: d.customerPhone,
            address: d.address,
            startDate: d.startDate,
            endDate: d.endDate,
            dietaryPreference: d.dietaryPreference || 'veg',
            deliveryTime: d.deliveryTime || '',
          });
        }
      }
    } catch {
      // Show page even if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadReceipt = () => {
    const d = paymentDetails;
    const lines = [
      '╔══════════════════════════════════════════╗',
      '║         MAMATIFFIN — PAYMENT RECEIPT         ║',
      '╚══════════════════════════════════════════╝',
      '',
      `  Date       : ${new Date().toLocaleDateString('en-IN')}`,
      `  Order ID   : ${d?.orderId ?? '—'}`,
      `  Payment ID : ${d?.paymentId ?? '—'}`,
      '',
      '──────────────────────────────────────────',
      '  ORDER DETAILS',
      '──────────────────────────────────────────',
      `  Customer   : ${d?.customerName ?? '—'}`,
      `  Menu       : ${d?.menuTitle ?? '—'}`,
      `  Plan       : ${getSubscriptionLabel(d?.subscriptionType ?? 'monthly')}`,
      `  Delivery   : ${d?.deliveryTime ?? '—'}`,
      `  Start Date : ${d?.startDate ? formatDate(d.startDate) : '—'}`,
      `  End Date   : ${d?.endDate ? formatDate(d.endDate) : '—'}`,
      '',
      '──────────────────────────────────────────',
      `  AMOUNT PAID: ₹${d?.totalAmount ?? 0}`,
      '──────────────────────────────────────────',
      '',
      '  Thank you for choosing MamaTiffin!',
      '  For support: mamatiffin.com/contact',
      '',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MamaTiffin-Receipt-${d?.orderId ?? 'order'}.txt`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf9] to-[#e6f7f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#328c81] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf9] to-[#e6f7f5] flex items-center justify-center p-4 py-10">
      <div className="max-w-xl w-full">

        {/* ── Success Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#328c81] rounded-full mb-5 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500">
            Aapka order confirm ho gaya hai. Delivery schedule ke according tiffin milega.
          </p>
        </div>

        {/* ── Order Card ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-5">

          {/* Card Header */}
          <div className="bg-[#328c81] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Order Confirmed</p>
              <p className="text-white font-bold text-lg">
                {paymentDetails?.menuTitle ?? 'Tiffin Plan'}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              paymentDetails?.dietaryPreference === 'veg'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {paymentDetails?.dietaryPreference === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
            </span>
          </div>

          <div className="p-6 space-y-5">

            {/* Amount */}
            <div className="flex items-center justify-between bg-[#f0fdf9] rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-[#328c81]" />
                <span className="text-gray-600 font-medium">Amount Paid</span>
              </div>
              <span className="text-2xl font-bold text-[#328c81]">
                ₹{paymentDetails?.totalAmount ?? 0}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#328c81] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {paymentDetails?.customerName || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#328c81] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Plan</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {getSubscriptionLabel(paymentDetails?.subscriptionType ?? 'monthly')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#328c81] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Delivery Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {paymentDetails?.deliveryTime || '—'}
                  </p>
                </div>
              </div>

              {paymentDetails?.address?.city && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#328c81] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {paymentDetails.address.homeLodgeName
                        ? `${paymentDetails.address.homeLodgeName}, `
                        : ''}
                      {paymentDetails.address.city}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Period */}
            {paymentDetails?.startDate && paymentDetails?.endDate && (
              <div className="border border-[#328c81]/20 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                  Subscription Period
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Start</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formatDate(paymentDetails.startDate)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#328c81]" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400">End</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formatDate(paymentDetails.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction IDs */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Transaction Details
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Order ID</span>
                <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded">
                  {paymentDetails?.orderId
                    ? `...${paymentDetails.orderId.slice(-10)}`
                    : searchParams.get('orderId')?.slice(-10) ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Payment ID</span>
                <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded">
                  {paymentDetails?.paymentId
                    ? `...${paymentDetails.paymentId.slice(-12)}`
                    : searchParams.get('paymentId')?.slice(-12) ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center gap-2 bg-[#328c81] hover:bg-[#2a7568] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Link>

          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 bg-white border border-[#328c81] text-[#328c81] hover:bg-[#f0fdf9] font-semibold py-3 px-4 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Receipt
          </button>

          <Link
            to="/home"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all col-span-2"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>

        {/* ── Auto Redirect ── */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            My Orders pe automatically redirect hoga{' '}
            <span className="font-bold text-[#328c81]">{countdown}s</span> mein
            {' · '}
            <button
              onClick={() => navigate('/my-orders')}
              className="underline text-[#328c81] hover:text-[#2a7568]"
            >
              Abhi jao
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

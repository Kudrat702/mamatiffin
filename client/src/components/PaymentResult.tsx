import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const state = (location.state || {}) as { status?: 'success' | 'failed'; reason?: string };

  const ok = state.status === 'success';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border rounded-xl p-6 text-center">
        <div className={`text-5xl mb-3 ${ok ? 'text-green-600' : 'text-red-600'}`}>
          {ok ? '✅' : '❌'}
        </div>
        <h1 className="text-2xl font-bold mb-1">
          {ok ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        {!ok && state.reason && (
          <p className="text-gray-600 mb-4">Reason: {state.reason}</p>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <Link to="/" className="px-4 py-2 rounded-lg bg-gray-100">Go Home</Link>
          <Link to="/admin/orders" className="px-4 py-2 rounded-lg bg-blue-600 text-white">View Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;

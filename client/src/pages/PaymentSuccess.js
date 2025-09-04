import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import paymentService from '../utils/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      toast.error('Invalid payment session');
      navigate('/');
      return;
    }

    const fetchTransactionDetails = async () => {
      try {
        const data = await paymentService.getTransactionDetails(paymentIntentId);
        setTransaction(data);
      } catch (error) {
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Payment Successful!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your booking has been confirmed.
              </p>
            </div>

            {transaction && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {transaction.booking.propertyId.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${transaction.booking.totalAmount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Check-in</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(transaction.booking.checkIn).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Check-out</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(transaction.booking.checkOut).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View Bookings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import paymentService from '../../utils/paymentService';
import LoadingSpinner from '../LoadingSpinner';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const data = await paymentService.getPaymentHistory();
      setPayments(data.bookings);
    } catch (error) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payment history found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {payments.map((booking) => (
          <li key={booking._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {booking.propertyId.title}
                  </p>
                  <p className="mt-1 flex items-center text-sm text-gray-500">
                    <span>
                      {format(new Date(booking.checkIn), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                    </span>
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'refunded'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {booking.paymentDetails?.cardBrand
                      ? `${booking.paymentDetails.cardBrand} **** ${booking.paymentDetails.lastFour}`
                      : 'Payment method not available'}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p className="font-medium text-gray-900">
                    ${booking.totalPrice.amount}
                  </p>
                </div>
              </div>
              {booking.paymentDetails?.receiptUrl && (
                <div className="mt-2">
                  <a
                    href={booking.paymentDetails.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    View Receipt
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentHistory;
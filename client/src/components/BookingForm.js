import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, differenceInDays, addDays } from 'date-fns';
import { FaCalendarAlt, FaUsers, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PaymentForm from './payments/PaymentForm';

const BookingForm = ({ property, onBookingSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    checkIn: null,
    checkOut: null,
    guests: {
      adults: 1,
      children: 0,
      infants: 0
    },
    specialRequests: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState({
    nightlyRate: 0,
    cleaningFee: 0,
    serviceFee: 0,
    taxes: 0,
    total: 0
  });

  // Calculate price breakdown when dates or guests change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && property) {
      const nights = differenceInDays(formData.checkOut, formData.checkIn);
      if (nights > 0) {
        const nightlyRate = property?.price?.amount ?? property?.pricePerNight ?? 0;
        const cleaningFee = property?.price?.cleaningFee || 0;
        const serviceFee = property?.price?.serviceFee || 0;
        const taxes = property?.price?.taxes || 0;
        const total = (nightlyRate * nights) + cleaningFee + serviceFee + taxes;

        setPriceBreakdown({
          nightlyRate,
          cleaningFee,
          serviceFee,
          taxes,
          total,
          nights
        });
      }
    }
  }, [formData.checkIn, formData.checkOut, property]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      checkIn: start,
      checkOut: end
    }));
  };

  const handleGuestChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: parseInt(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book this property');
      navigate('/login');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (formData.checkOut <= formData.checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!property) {
      toast.error('Property information is not available. Please try again.');
      return;
    }

    const totalGuests = formData.guests.adults + formData.guests.children + formData.guests.infants;
    if (property?.capacity?.guests != null && totalGuests > property.capacity.guests) {
      toast.error(`This property can only accommodate ${property.capacity.guests} guests`);
      return;
    }

    setLoading(true);
    
    try {
      // Show payment form when dates and guests are selected
      setShowPayment(true);
      return;
      
      // This code is unreachable due to the return statement above
      // if (onBookingSuccess) {
      //   onBookingSuccess(response.data.booking);
      // }
      
      // Reset form
      setFormData({
        checkIn: null,
        checkOut: null,
        guests: {
          adults: 1,
          children: 0,
          infants: 0
        },
        specialRequests: ''
      });
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  const maxDate = addDays(new Date(), 365); // Allow booking up to 1 year in advance

  const totalGuests = formData.guests.adults + formData.guests.children + formData.guests.infants;

  return (
    <div className="bg-white rounded-xl shadow-airbnb p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          ${property?.price?.amount ?? property?.pricePerNight ?? 0} <span className="text-gray-600 text-lg">night</span>
        </h3>
        {property?.rating?.average > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{property.rating.average} ({property.rating.count} reviews)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            Check-in - Check-out
          </label>
          <DatePicker
            selected={formData.checkIn}
            onChange={handleDateChange}
            startDate={formData.checkIn}
            endDate={formData.checkOut}
            selectsRange
            minDate={minDate}
            maxDate={maxDate}
            placeholderText="Select dates"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
            dateFormat="MMM dd, yyyy"
          />
        </div>

        {/* Guest Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-2" />
            Guests
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Adults</label>
              <select
                value={formData.guests.adults}
                onChange={(e) => handleGuestChange('adults', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
              >
                {[...Array(16)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Children</label>
              <select
                value={formData.guests.children}
                onChange={(e) => handleGuestChange('children', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
              >
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Infants</label>
              <select
                value={formData.guests.infants}
                onChange={(e) => handleGuestChange('infants', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
              >
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
          {totalGuests > (property?.capacity?.guests ?? Infinity) && (
            <p className="text-red-500 text-sm mt-1">
              Maximum {property?.capacity?.guests} guests allowed
            </p>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaInfoCircle className="inline mr-2" />
            Special Requests (Optional)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
            placeholder="Any special requests or questions for the host?"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none resize-none"
          />
          <p className="text-xs text-gray-500 text-right">
            {formData.specialRequests.length}/500
          </p>
        </div>

        {/* Price Breakdown */}
        {priceBreakdown.nights > 0 && (
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>${priceBreakdown.nightlyRate} × {priceBreakdown.nights} nights</span>
                <span>${(priceBreakdown.nightlyRate * priceBreakdown.nights).toFixed(2)}</span>
              </div>
              {priceBreakdown.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${priceBreakdown.cleaningFee.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${priceBreakdown.serviceFee.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.taxes > 0 && (
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>${priceBreakdown.taxes.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${priceBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showPayment ? (
          <button
            type="submit"
            disabled={
              loading ||
              !formData.checkIn ||
              !formData.checkOut ||
              (property?.capacity?.guests != null && totalGuests > property.capacity.guests)
            }
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FaCreditCard className="mr-2" />
            Continue to Payment
          </button>
        ) : (
          <PaymentForm
            amount={priceBreakdown.total}
            onSuccess={async (paymentMethod) => {
              try {
                const response = await api.post('/api/bookings', {
                  propertyId: property._id,
                  checkIn: formData.checkIn.toISOString(),
                  checkOut: formData.checkOut.toISOString(),
                  guests: formData.guests,
                  specialRequests: formData.specialRequests,
                  paymentMethodId: paymentMethod.id
                });

                toast.success('Booking confirmed successfully!');
                if (onBookingSuccess) {
                  onBookingSuccess(response.data.booking);
                }

                // Reset form
                setFormData({
                  checkIn: null,
                  checkOut: null,
                  guests: {
                    adults: 1,
                    children: 0,
                    infants: 0
                  },
                  specialRequests: ''
                });
                setShowPayment(false);
              } catch (error) {
                const message = error.response?.data?.message || 'Failed to create booking';
                toast.error(message);
              }
            }}
          />
        )}

        {property?.availability?.instantBookable && (
          <p className="text-xs text-gray-600 text-center">
            You won't be charged yet
          </p>
        )}

        {/* Host Information */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            This property is hosted by <span className="font-medium">{property?.host?.name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {property?.availability?.checkIn} check-in • {property?.availability?.checkOut} check-out
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

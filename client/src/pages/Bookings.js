import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaStar, FaEllipsisV, FaCheck, FaTimes, FaBan } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Bookings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, activeTab, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const role = activeTab === 'host' ? 'host' : activeTab === 'guest' ? 'guest' : null;
      const response = await api.get(`/bookings?role=${role}&page=${currentPage}`);
      
      setBookings(response.data.bookings);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        reason
      });

      toast.success(`Booking ${newStatus} successfully`);
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, ...response.data.booking }
            : booking
        )
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update booking status';
      toast.error(message);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      await handleStatusUpdate(bookingId, 'cancelled', reason);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: '🏁' },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: '🚫' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActionButtons = (booking) => {
    const buttons = [];

    if (booking.status === 'pending') {
      if (activeTab === 'host') {
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaCheck className="inline mr-1" />
            Confirm
          </button>
        );
        buttons.push(
          <button
            key="reject"
            onClick={() => handleStatusUpdate(booking._id, 'rejected')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaTimes className="inline mr-1" />
            Reject
          </button>
        );
      } else {
        buttons.push(
          <button
            key="cancel"
            onClick={() => handleCancel(booking._id)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaBan className="inline mr-1" />
            Cancel
          </button>
        );
      }
    }

    if (booking.status === 'confirmed' && activeTab === 'guest') {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleCancel(booking._id)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaBan className="inline mr-1" />
          Cancel
        </button>
      );
    }

    if (booking.status === 'completed' && activeTab === 'guest') {
      buttons.push(
        <button
          key="review"
          onClick={() => {
            setSelectedBooking(booking);
            setShowReviewForm(true);
          }}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaStar className="inline mr-1" />
          Write Review
        </button>
      );
    }

    return buttons;
  };

  const renderBookingCard = (booking) => {
    const isHost = activeTab === 'host';
    const otherParty = isHost ? booking.guest : booking.host;
    const property = booking.property;

    return (
      <div key={booking._id} className="bg-white rounded-xl shadow-airbnb p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {property?.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <FaMapMarkerAlt className="mr-1" />
                {property?.location?.city}, {property?.location?.state}
              </span>
              <span className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center">
                <FaUsers className="mr-1" />
                {booking.totalGuests} guests
              </span>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${booking.totalPrice?.amount}
            </div>
            <div className="text-sm text-gray-600">
              {booking.nights} night{booking.nights !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {isHost ? 'Guest' : 'Host'} Information
            </h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {otherParty?.avatar ? (
                  <img 
                    src={otherParty.avatar} 
                    alt={otherParty.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {otherParty?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{otherParty?.name}</p>
                <p className="text-sm text-gray-600">{otherParty?.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Check-in: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
              <p>Check-out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
              <p>Adults: {booking.guests?.adults}</p>
              {booking.guests?.children > 0 && <p>Children: {booking.guests.children}</p>}
              {booking.guests?.infants > 0 && <p>Infants: {booking.guests.infants}</p>}
            </div>
          </div>
        </div>

        {booking.specialRequests && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Special Requests</h4>
            <p className="text-sm text-gray-600">{booking.specialRequests}</p>
          </div>
        )}

        {booking.cancellationReason && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-1">Cancellation Reason</h4>
            <p className="text-sm text-red-700">{booking.cancellationReason}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {getActionButtons(booking)}
          </div>
          
          <div className="text-sm text-gray-500">
            Booked on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your upcoming and past stays</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'guest', label: 'As Guest' },
                { key: 'host', label: 'As Host' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-airbnb-pink text-airbnb-pink'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You don't have any bookings yet."
                : activeTab === 'guest'
                ? "You haven't booked any properties yet."
                : "You haven't hosted any guests yet."
              }
            </p>
            {activeTab !== 'host' && (
              <button
                onClick={() => navigate('/properties')}
                className="mt-4 btn-primary"
              >
                Browse Properties
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(renderBookingCard)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? 'bg-airbnb-pink text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* ReviewForm component would go here */}
              <div className="text-center py-8 text-gray-500">
                Review form component placeholder
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

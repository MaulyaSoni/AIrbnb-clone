import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaThumbsUp, FaComment } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ReviewForm = ({ property, booking, onReviewSubmitted, onCancel }) => {
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    rating: {
      overall: 0,
      cleanliness: 0,
      communication: 0,
      checkIn: 0,
      accuracy: 0,
      location: 0,
      value: 0
    },
    title: '',
    comment: '',
    privateComment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({});

  const ratingCategories = [
    { key: 'overall', label: 'Overall', required: true },
    { key: 'cleanliness', label: 'Cleanliness', required: true },
    { key: 'communication', label: 'Communication', required: true },
    { key: 'checkIn', label: 'Check-in', required: true },
    { key: 'accuracy', label: 'Accuracy', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'value', label: 'Value', required: true }
  ];

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        [category]: value
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    const requiredRatings = ratingCategories.filter(cat => cat.required);
    const hasAllRatings = requiredRatings.every(cat => formData.rating[cat.key] > 0);
    const hasTitle = formData.title.trim().length > 0;
    const hasComment = formData.comment.trim().length > 0;
    
    return hasAllRatings && hasTitle && hasComment;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/api/reviews', {
        propertyId: property._id,
        bookingId: booking._id,
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        privateComment: formData.privateComment.trim()
      });

      toast.success('Review submitted successfully!');
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }
      
      // Reset form
      setFormData({
        rating: {
          overall: 0,
          cleanliness: 0,
          communication: 0,
          checkIn: 0,
          accuracy: 0,
          location: 0,
          value: 0
        },
        title: '',
        comment: '',
        privateComment: ''
      });
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (category, value, required = false) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {category} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(category.toLowerCase(), star)}
              onMouseEnter={() => setHoveredRating({ ...hoveredRating, [category]: star })}
              onMouseLeave={() => setHoveredRating({ ...hoveredRating, [category]: 0 })}
              className="text-2xl transition-colors duration-200 focus:outline-none"
            >
              <FaStar
                className={`${
                  star <= (hoveredRating[category] || value)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {value > 0 && `${value}/5`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-airbnb p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          <FaComment className="inline mr-2 text-airbnb-pink" />
          Write a Review
        </h3>
        <p className="text-gray-600">
          Share your experience at {property?.title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Categories */}
        <div className="space-y-2">
          {ratingCategories.map(({ key, label, required }) => (
            <div key={key}>
              {renderStarRating(label, formData.rating[key], required)}
            </div>
          ))}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaThumbsUp className="inline mr-2" />
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Summarize your experience in a few words"
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
            required
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {formData.title.length}/100
          </p>
        </div>

        {/* Public Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaComment className="inline mr-2" />
            Public Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Tell others about your stay. What did you like? What could be improved?"
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none resize-none"
            required
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {formData.comment.length}/1000
          </p>
        </div>

        {/* Private Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaComment className="inline mr-2" />
            Private Comment (Optional)
          </label>
          <textarea
            value={formData.privateComment}
            onChange={(e) => handleInputChange('privateComment', e.target.value)}
            placeholder="This comment will only be visible to the host"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none resize-none"
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {formData.privateComment.length}/500
          </p>
        </div>

        {/* Booking Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Check-in: {new Date(booking?.checkIn).toLocaleDateString()}</p>
            <p>Check-out: {new Date(booking?.checkOut).toLocaleDateString()}</p>
            <p>Guests: {booking?.guests?.adults} adults, {booking?.guests?.children} children, {booking?.guests?.infants} infants</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Your review will help other travelers make informed decisions
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Carousel } from 'react-bootstrap';
import {
  FaCheck,
  FaMapMarkerAlt,
  FaStar,
  FaBed,
  FaBath,
  FaUsers,
  FaHeart,
  FaShare,
  FaUser
} from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BookingForm from '../components/BookingForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/properties/${id}`);
      setProperty(data);
    } catch (err) {
      console.error("Error fetching property:", err.response?.data || err.message);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }
    try {
      await api.post(`/properties/${id}/favorite`, {});
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // 🧠 Address formatting logic
  const fullAddress = property.location
    ? `${property.location.address}, ${property.location.city}, ${property.location.state} ${property.location.zipCode}, ${property.location.country}`
    : 'Location not specified';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images and Info */}
          <div className="lg:col-span-2">
            <Carousel indicators controls keyboard wrap interval={null} className="rounded-xl shadow-lg overflow-hidden">
              {property.images?.map((img, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={img?.url || img}
                    alt={`${property.title} ${index + 1}`}
                    className="d-block w-100 object-cover h-[500px]"
                  />
                </Carousel.Item>
              ))}
            </Carousel>

            {/* Property Details */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">{property.title}</h2>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2" />
                {fullAddress}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 mr-1" />
                <span>
                  {(property?.rating?.average ? property.rating.average.toFixed(1) : 'New')} ({property?.rating?.count || property?.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <FaBed className="text-2xl mx-auto mb-1" />
                  <p>{property?.capacity?.beds ?? property?.capacity?.bedrooms ?? 0} Beds</p>
                </div>
                <div>
                  <FaBath className="text-2xl mx-auto mb-1" />
                  <p>{property?.capacity?.bathrooms ?? 0} Baths</p>
                </div>
                <div>
                  <FaUsers className="text-2xl mx-auto mb-1" />
                  <p>{property?.capacity?.guests ?? 0} Guests</p>
                </div>
              </div>

              {/* Description */}
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-700 mb-6">{property.description}</p>

              {/* Amenities */}
              <h3 className="text-xl font-semibold mb-2">Amenities</h3>
              <ul className="grid grid-cols-2 gap-2 mb-6">
                {property.amenities?.map((amenity, index) => (
                  <li key={index} className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" /> {amenity}
                  </li>
                ))}
              </ul>

              {/* Host Info */}
              <h3 className="text-xl font-semibold mb-2">Hosted by</h3>
              <div className="flex items-center mb-6">
                <FaUser className="text-3xl mr-3 text-gray-500" />
                <div>
                  <p className="font-semibold">{property.host?.name}</p>
                  <p className="text-sm text-gray-600">
                    Joined in {new Date(property.host?.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Reviews */}
              <h3 className="text-xl font-semibold mb-2">Reviews</h3>
              {property.reviews?.length > 0 ? (
                property.reviews.map((review, index) => (
                  <div key={index} className="border-b py-4">
                    <div className="flex items-center mb-2">
                      <FaUser className="mr-2 text-gray-500" />
                      <span className="font-semibold">{review.user?.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar - Booking & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg">
              <div className="text-2xl font-bold mb-4">${property.pricePerNight} / night</div>
              <BookingForm property={property} />

              <div className="mt-6 flex justify-between">
                <button
                  onClick={toggleFavorite}
                  className="flex items-center px-4 py-2 bg-pink-100 rounded-lg hover:bg-pink-200"
                >
                  <FaHeart className={`mr-2 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={shareProperty}
                  className="flex items-center px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                >
                  <FaShare className="mr-2 text-blue-500" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

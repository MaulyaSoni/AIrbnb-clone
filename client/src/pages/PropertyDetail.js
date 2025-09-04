import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaStar, FaBed, FaBath, FaUsers, FaHeart, FaShare, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BookingForm from '../components/BookingForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
      
      // Check if property is in user's favorites
      if (user && user.favorites) {
        setIsFavorite(user.favorites.includes(response.data._id));
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property details');
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
        title: property.title,
        text: property.description,
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative">
            <img
              src={property.images[currentImageIndex]?.url || '/placeholder-property.jpg'}
              alt={property.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  →
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Navigation */}
          {property.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-airbnb-pink' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2" />
                <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <FaUsers className="mr-1" />
                  {property.capacity.guests} guests
                </span>
                <span className="flex items-center">
                  <FaBed className="mr-1" />
                  {property.capacity.bedrooms} bedrooms
                </span>
                <span className="flex items-center">
                  <FaBath className="mr-1" />
                  {property.capacity.bathrooms} bathrooms
                </span>
              </div>
              
              {property.rating.average > 0 && (
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{property.rating.average}</span>
                  <span className="text-gray-500 ml-1">({property.rating.count} reviews)</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${property.price.amount}
                </div>
                <div className="text-gray-600">per night</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    isFavorite
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <FaHeart />
                </button>
                <button
                  onClick={shareProperty}
                  className="p-3 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-gray-400 transition-colors duration-200"
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {property.rules && property.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">House rules</h2>
                <ul className="space-y-2">
                  {property.rules.map((rule, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Form */}
            <BookingForm property={property} />

            {/* Host Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the host</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                  {property.host?.avatar ? (
                    <img
                      src={property.host.avatar}
                      alt={property.host.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{property.host?.name}</div>
                  <div className="text-sm text-gray-600">Host</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <FaPhone />
                  Contact Host
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <FaEnvelope />
                  Send Message
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

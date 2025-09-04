import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaMapMarkerAlt, FaDollarSign, FaBed, FaBath, FaUsers, FaUpload, FaSave } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    price: {
      amount: '',
      currency: 'USD',
      perNight: true
    },
    capacity: {
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1
    },
    amenities: [],
    rules: [''],
    images: [{ url: '', caption: '', isPrimary: true }],
    availability: {
      checkIn: '15:00',
      checkOut: '11:00',
      instantBookable: false,
      minStay: 1
    }
  });

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning', 'Heating',
    'TV', 'Cable TV', 'Free Parking', 'Pool', 'Hot Tub', 'Gym',
    'Breakfast', 'Pets Allowed', 'Family Friendly', 'Wheelchair Accessible',
    'Elevator', 'Doorman', 'Balcony', 'Garden', 'BBQ Grill', 'Fireplace'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'condo', label: 'Condo' },
    { value: 'loft', label: 'Loft' },
    { value: 'studio', label: 'Studio' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRule = (index) => {
    if (formData.rules.length > 1) {
      const newRules = formData.rules.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, rules: newRules }));
    }
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', caption: '', isPrimary: false }]
    }));
  };

  const removeImage = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      // Ensure at least one image is primary
      if (!newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.location.address || 
          !formData.location.city || !formData.location.state || !formData.location.country ||
          !formData.price.amount || formData.images[0].url === '') {
        toast.error('Please fill in all required fields');
        return;
      }

      // Filter out empty rules
      const filteredRules = formData.rules.filter(rule => rule.trim() !== '');
      
      // Filter out images without URLs
      const filteredImages = formData.images.filter(img => img.url.trim() !== '');

      const propertyData = {
        ...formData,
        rules: filteredRules,
        images: filteredImages
      };

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const response = await axios.post(`${API_BASE_URL}/api/properties`, propertyData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Property created successfully!');
      navigate(`/property/${response.data.property._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to add a property.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-gray-600">Share your space with travelers around the world</p>
        </div>

        {/* Property Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaHome className="mr-2 text-airbnb-pink" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Cozy Downtown Apartment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe your property, its features, and what makes it special..."
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-airbnb-pink" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="New York"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="NY"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="United States"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaDollarSign className="mr-2 text-airbnb-pink" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night *
                </label>
                <input
                  type="number"
                  name="price.amount"
                  value={formData.price.amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="100"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="price.currency"
                  value={formData.price.currency}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="price.perNight"
                    checked={formData.price.perNight}
                    onChange={handleChange}
                    className="mr-2 text-airbnb-pink focus:ring-airbnb-pink"
                  />
                  <span className="text-sm text-gray-700">Price per night</span>
                </label>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUsers className="mr-2 text-airbnb-pink" />
              Capacity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests *
                </label>
                <input
                  type="number"
                  name="capacity.guests"
                  value={formData.capacity.guests}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="capacity.bedrooms"
                  value={formData.capacity.bedrooms}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="capacity.bathrooms"
                  value={formData.capacity.bathrooms}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beds *
                </label>
                <input
                  type="number"
                  name="capacity.beds"
                  value={formData.capacity.beds}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="mr-2 text-airbnb-pink focus:ring-airbnb-pink"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUpload className="mr-2 text-airbnb-pink" />
              Images
            </h2>
            
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL {index === 0 ? '*' : ''}
                    </label>
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                      required={index === 0}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                      className="input-field"
                      placeholder="Beautiful living room"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`px-3 py-2 text-xs rounded ${
                        image.isPrimary
                          ? 'bg-airbnb-pink text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {image.isPrimary ? 'Primary' : 'Set Primary'}
                    </button>
                    
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImage}
                className="btn-secondary"
              >
                Add Another Image
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Property...' : (
                <>
                  <FaSave className="mr-2" />
                  Create Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;

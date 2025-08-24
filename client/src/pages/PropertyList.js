import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AnimatedPropertyCard from '../components/AnimatedPropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fadeIn, slideUp, staggerContainer } from '../utils/animations';

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    guests: searchParams.get('guests') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchProperties();
  }, [filters, pagination.currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Create a clean params object without array values
      const cleanFilters = {};
      
      // Process each filter properly
      Object.entries(filters).forEach(([key, value]) => {
        // Skip empty values
        if (!value || (Array.isArray(value) && value.length === 0)) return;
        
        // Handle arrays separately
        if (key === 'amenities' && Array.isArray(value) && value.length > 0) {
          cleanFilters[key] = value.join(',');
        } else {
          cleanFilters[key] = value;
        }
      });
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...cleanFilters
      });

      const response = await api.get(`/properties?${params}`);
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error fetching properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      bedrooms: '',
      bathrooms: '',
      amenities: []
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning', 'Heating',
    'TV', 'Free Parking', 'Pool', 'Hot Tub', 'Gym', 'Breakfast'
  ];

  if (loading && properties.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 py-8 flex flex-col items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="text-center mb-8">
          <LoadingSpinner size="lg" text="Finding amazing places for you..." />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            className="animate-pulse"
            variants={staggerContainer}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div 
                  key={i} 
                  className="bg-white rounded-xl shadow-md"
                  variants={slideUp}
                >
                  <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={slideUp}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Places to stay
          </h1>
          <p className="text-gray-600">
            {pagination.totalItems} places available
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          variants={slideUp}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations, properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Filter Button */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter />
              Filters
            </motion.button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabin</option>
                    <option value="condo">Condo</option>
                    <option value="loft">Loft</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={filters.guests}
                    onChange={(e) => handleFilterChange('guests', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}+ guests</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('amenities', [...filters.amenities, amenity]);
                          } else {
                            handleFilterChange('amenities', filters.amenities.filter(a => a !== amenity));
                          }
                        }}
                        className="mr-2 text-airbnb-pink focus:ring-airbnb-pink"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-6 flex gap-3">
                <motion.button 
                  onClick={applyFilters} 
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply Filters
                </motion.button>
                <motion.button 
                  onClick={clearFilters} 
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
              </div>
            </div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Properties Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {properties.map(property => (
              <AnimatedPropertyCard key={property._id} property={property} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div 
            className="mt-12 flex justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <nav className="flex items-center space-x-2">
              <motion.button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: pagination.currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: pagination.currentPage === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-airbnb-pink text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ))}
              
              <motion.button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 1.05 }}
                whileTap={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </nav>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && properties.length === 0 && (
          <motion.div 
            className="text-center py-12"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="text-gray-400 text-6xl mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              🏠
            </motion.div>
            <motion.h3 
              className="text-lg font-medium text-gray-900 mb-2"
              variants={slideUp}
            >
              No properties found
            </motion.h3>
            <motion.p 
              className="text-gray-600"
              variants={slideUp}
            >
              Try adjusting your search criteria or filters.
            </motion.p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyList;

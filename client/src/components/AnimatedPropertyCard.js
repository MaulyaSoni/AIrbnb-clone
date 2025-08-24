import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaStar, FaBed, FaBath, FaUsers } from 'react-icons/fa';
import { popIn } from '../utils/animations';

const AnimatedPropertyCard = ({ property }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-airbnb hover:shadow-airbnb-hover transition-all duration-300"
      variants={popIn}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <Link to={`/properties/${property._id}`}>
        <div className="relative overflow-hidden rounded-t-xl">
          <motion.img
            src={property.images[0]?.url || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-56 object-cover transition-transform duration-500"
            whileHover={{ scale: 1.05 }}
          />
          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 shadow-md">
            ${property.price.amount}/night
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {property.title}
            </h3>
            {property.rating.average > 0 && (
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="font-medium">{property.rating.average}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-3 flex items-center">
            <FaMapMarkerAlt className="text-airbnb-pink mr-1" />
            {property.location.city}, {property.location.state}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <FaUsers className="mr-1" />
              {property.capacity.guests}
            </span>
            <span className="flex items-center">
              <FaBed className="mr-1" />
              {property.capacity.bedrooms}
            </span>
            <span className="flex items-center">
              <FaBath className="mr-1" />
              {property.capacity.bathrooms}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {property.amenities.slice(0, 3).map(amenity => (
              <span 
                key={amenity} 
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimatedPropertyCard;
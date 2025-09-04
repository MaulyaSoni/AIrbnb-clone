import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await axios.get('/api/properties/my-properties');
        setProperties(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your properties');
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`/api/properties/${propertyId}`);
        setProperties(properties.filter(property => property._id !== propertyId));
      } catch (err) {
        setError('Failed to delete property');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airbnb-pink"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <Link
          to="/add-property"
          className="bg-airbnb-pink text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors"
        >
          Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
          <Link
            to="/add-property"
            className="text-airbnb-pink hover:text-pink-600 font-medium inline-block mt-4"
          >
            List your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {property.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  ${property.price} per night
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/edit-property/${property._id}`}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(property._id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
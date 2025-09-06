const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    perNight: {
      type: Boolean,
      default: true
    }
  },
  capacity: {
    guests: {
      type: Number,
      required: [true, 'Guest capacity is required'],
      min: [1, 'Must accommodate at least 1 guest']
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative']
    },
    beds: {
      type: Number,
      required: [true, 'Number of beds is required'],
      min: [1, 'Must have at least 1 bed']
    }
  },
  amenities: [{
    type: String,
    enum: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning', 'Heating',
      'TV', 'Cable TV', 'Free Parking', 'Pool', 'Hot Tub', 'Gym',
      'Breakfast', 'Pets Allowed', 'Family Friendly', 'Wheelchair Accessible',
      'Elevator', 'Doorman', 'Balcony', 'Garden', 'BBQ Grill', 'Fireplace'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  rules: [{
    type: String,
    maxlength: [200, 'Rule cannot be more than 200 characters']
  }],
  availability: {
    checkIn: {
      type: String,
      default: '15:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    instantBookable: {
      type: Boolean,
      default: false
    },
    minStay: {
      type: Number,
      default: 1,
      min: [1, 'Minimum stay must be at least 1 night']
    },
    maxStay: {
      type: Number,
      min: [1, 'Maximum stay must be at least 1 night']
    }
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
], 
  views: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  tags: [String]
}, {
  timestamps: true
});

// Index for search functionality
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text',
  'location.country': 'text',
  tags: 'text'
});

// Virtual for price per night
propertySchema.virtual('pricePerNight').get(function() {
  return this.price.perNight ? this.price.amount : this.price.amount / 30;
});

// Method to update rating
propertySchema.methods.updateRating = function() {
  const Review = mongoose.model('Review');
  return Review.aggregate([
    { $match: { property: this._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]).then(result => {
    if (result.length > 0) {
      this.rating.average = Math.round(result[0].avgRating * 10) / 10;
      this.rating.count = result[0].count;
    } else {
      this.rating.average = 0;
      this.rating.count = 0;
    }
    return this.save();
  });
};

// Ensure virtual fields are serialized
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest is required']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      required: [true, 'Cleanliness rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    communication: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    checkIn: {
      type: Number,
      required: [true, 'Check-in rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    accuracy: {
      type: Number,
      required: [true, 'Accuracy rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    location: {
      type: Number,
      required: [true, 'Location rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    value: {
      type: Number,
      required: [true, 'Value rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  privateComment: {
    type: String,
    trim: true,
    maxlength: [500, 'Private comment cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean
  }],
  response: {
    host: {
      comment: String,
      date: Date
    }
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged'],
    default: 'active'
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'other']
    },
    description: String,
    date: Date
  }]
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ property: 1, createdAt: -1 });
reviewSchema.index({ guest: 1, createdAt: -1 });
reviewSchema.index({ host: 1, createdAt: -1 });
reviewSchema.index({ 'rating.overall': -1 });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.cleanliness,
    this.rating.communication,
    this.rating.checkIn,
    this.rating.accuracy,
    this.rating.location,
    this.rating.value
  ];
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === true).length;
});

// Method to update property rating
reviewSchema.methods.updatePropertyRating = async function() {
  const Property = mongoose.model('Property');
  const Review = mongoose.model('Review');
  
  const result = await Review.aggregate([
    { $match: { property: this.property, status: 'active' } },
    { $group: { 
      _id: null, 
      avgOverall: { $avg: '$rating.overall' },
      avgCleanliness: { $avg: '$rating.cleanliness' },
      avgCommunication: { $avg: '$rating.communication' },
      avgCheckIn: { $avg: '$rating.checkIn' },
      avgAccuracy: { $avg: '$rating.accuracy' },
      avgLocation: { $avg: '$rating.location' },
      avgValue: { $avg: '$rating.value' },
      count: { $sum: 1 }
    }}
  ]);
  
  if (result.length > 0) {
    const data = result[0];
    await Property.findByIdAndUpdate(this.property, {
      'rating.average': Math.round(data.avgOverall * 10) / 10,
      'rating.count': data.count
    });
  }
};

// Pre-save middleware to update property rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating') || this.isModified('status')) {
    try {
      await this.updatePropertyRating();
    } catch (error) {
      console.error('Error updating property rating:', error);
    }
  }
  next();
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);

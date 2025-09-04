const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'Must have at least 1 adult']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children cannot be negative']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infants cannot be negative']
    }
  },
  totalPrice: {
    amount: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    breakdown: {
      nightlyRate: Number,
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    paymentIntentId: String,
    paymentMethodId: String,
    stripeCustomerId: String,
    receiptUrl: String,
    lastFour: String,
    cardBrand: String
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  cancellationReason: String,
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super_strict'],
    default: 'moderate'
  },
  refundAmount: Number,
  notes: {
    guest: String,
    host: String
  },
  isInstantBook: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

// Virtual for number of nights
bookingSchema.virtual('nights').get(function() {
  if (!this.checkIn || !this.checkOut) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.ceil((this.checkOut - this.checkIn) / oneDay);
});

// Virtual for total guests
bookingSchema.virtual('totalGuests').get(function() {
  return (this.guests.adults || 0) + (this.guests.children || 0) + (this.guests.infants || 0);
});

// Method to check if dates overlap with existing bookings
bookingSchema.methods.hasDateConflict = async function() {
  const existingBooking = await this.constructor.findOne({
    property: this.property,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        checkIn: { $lt: this.checkOut },
        checkOut: { $gt: this.checkIn }
      }
    ]
  });
  
  return !!existingBooking;
};

// Method to calculate total price
bookingSchema.methods.calculateTotalPrice = function(nightlyRate, cleaningFee = 0, serviceFee = 0, taxes = 0) {
  const nights = this.nights;
  const basePrice = nightlyRate * nights;
  const total = basePrice + cleaningFee + serviceFee + taxes;
  
  this.totalPrice = {
    amount: total,
    currency: this.totalPrice?.currency || 'USD',
    breakdown: {
      nightlyRate: nightlyRate,
      cleaningFee: cleaningFee,
      serviceFee: serviceFee,
      taxes: taxes
    }
  };
  
  return total;
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);

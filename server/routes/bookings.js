const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
  auth,
  [
    body('propertyId').isMongoId().withMessage('Valid property ID is required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
    body('guests.adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
    body('guests.children').optional().isInt({ min: 0 }).withMessage('Children count must be non-negative'),
    body('guests.infants').optional().isInt({ min: 0 }).withMessage('Infants count must be non-negative'),
    body('specialRequests').optional().isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;
    const guestId = req.user.id;

    // Check if property exists and is active
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'active') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    // Check if user is trying to book their own property
    if (property.host.toString() === guestId) {
      return res.status(400).json({ message: 'You cannot book your own property' });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (checkInDate <= now) {
      return res.status(400).json({ message: 'Check-in date must be in the future' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check minimum stay requirement
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights < property.availability.minStay) {
      return res.status(400).json({ 
        message: `Minimum stay is ${property.availability.minStay} nights` 
      });
    }

    // Check maximum stay requirement
    if (property.availability.maxStay && nights > property.availability.maxStay) {
      return res.status(400).json({ 
        message: `Maximum stay is ${property.availability.maxStay} nights` 
      });
    }

    // Check if dates are available
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Selected dates are not available' });
    }

    // Calculate total price
    const cleaningFee = property.price.cleaningFee || 0;
    const serviceFee = property.price.serviceFee || 0;
    const taxes = property.price.taxes || 0;
    const nightlyRate = property.price.amount;
    const totalPrice = (nightlyRate * nights) + cleaningFee + serviceFee + taxes;

    // Create booking
    const booking = new Booking({
      property: propertyId,
      guest: guestId,
      host: property.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice: {
        amount: totalPrice,
        currency: property.price.currency,
        breakdown: {
          nightlyRate,
          cleaningFee,
          serviceFee,
          taxes
        }
      },
      specialRequests,
      isInstantBook: property.availability.instantBookable
    });

    // If instant bookable, automatically confirm
    if (property.availability.instantBookable) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'pending';
    }

    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'property', select: 'title images location price' },
      { path: 'host', select: 'name avatar' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings (as guest or host)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    let query = {};
    let populateFields = [];

    if (role === 'guest') {
      query.guest = userId;
      populateFields = [
        { path: 'property', select: 'title images location price' },
        { path: 'host', select: 'name avatar' }
      ];
    } else if (role === 'host') {
      query.host = userId;
      populateFields = [
        { path: 'property', select: 'title images location price' },
        { path: 'guest', select: 'name avatar' }
      ];
    } else {
      // Get all bookings where user is either guest or host
      query.$or = [{ guest: userId }, { host: userId }];
      populateFields = [
        { path: 'property', select: 'title images location price' },
        { path: 'guest', select: 'name avatar' },
        { path: 'host', select: 'name avatar' }
      ];
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: 'property', select: 'title images location price amenities rules availability' },
        { path: 'guest', select: 'name email phone avatar' },
        { path: 'host', select: 'name email phone avatar' }
      ]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (booking.guest.toString() !== req.user.id && 
        booking.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (host can confirm/reject, guest can cancel)
// @access  Private
router.put('/:id/status', [
  auth,
  [
    body('status').isIn(['confirmed', 'rejected', 'cancelled']).withMessage('Invalid status'),
    body('reason').optional().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    if (status === 'confirmed' || status === 'rejected') {
      // Only host can confirm/reject
      if (booking.host.toString() !== userId) {
        return res.status(403).json({ message: 'Only host can confirm or reject bookings' });
      }
    } else if (status === 'cancelled') {
      // Guest can cancel, host can cancel confirmed bookings
      if (booking.guest.toString() !== userId && 
          (booking.host.toString() !== userId || booking.status !== 'confirmed')) {
        return res.status(403).json({ message: 'Cannot cancel this booking' });
      }
    }

    // Update status
    booking.status = status;
    
    if (status === 'cancelled') {
      booking.cancellationReason = reason;
      // Calculate refund based on cancellation policy
      const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
      const daysUntilCheckIn = Math.ceil((booking.checkIn - new Date()) / (1000 * 60 * 60 * 24));
      
      let refundPercentage = 0;
      switch (booking.cancellationPolicy) {
        case 'flexible':
          refundPercentage = daysUntilCheckIn >= 1 ? 100 : 50;
          break;
        case 'moderate':
          refundPercentage = daysUntilCheckIn >= 5 ? 100 : daysUntilCheckIn >= 1 ? 50 : 0;
          break;
        case 'strict':
          refundPercentage = daysUntilCheckIn >= 7 ? 50 : 0;
          break;
        case 'super_strict':
          refundPercentage = daysUntilCheckIn >= 30 ? 50 : 0;
          break;
      }
      
      booking.refundAmount = (booking.totalPrice.amount * refundPercentage) / 100;
    }

    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking details
// @access  Private
router.put('/:id', [
  auth,
  [
    body('checkIn').optional().isISO8601().withMessage('Valid check-in date is required'),
    body('checkOut').optional().isISO8601().withMessage('Valid check-out date is required'),
    body('guests.adults').optional().isInt({ min: 1 }).withMessage('At least 1 adult is required'),
    body('guests.children').optional().isInt({ min: 0 }).withMessage('Children count must be non-negative'),
    body('guests.infants').optional().isInt({ min: 0 }).withMessage('Infants count must be non-negative'),
    body('specialRequests').optional().isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { checkIn, checkOut, guests, specialRequests } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only guest can modify their own booking
    if (booking.guest.toString() !== userId) {
      return res.status(403).json({ message: 'Only guest can modify booking' });
    }

    // Cannot modify confirmed or completed bookings
    if (['confirmed', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot modify confirmed or completed bookings' });
    }

    // Update fields
    if (checkIn) booking.checkIn = new Date(checkIn);
    if (checkOut) booking.checkOut = new Date(checkOut);
    if (guests) booking.guests = { ...booking.guests, ...guests };
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;

    // Recalculate price if dates or guests changed
    if (checkIn || checkOut || guests) {
      const property = await Property.findById(booking.property);
      const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
      const cleaningFee = property.price.cleaningFee || 0;
      const serviceFee = property.price.serviceFee || 0;
      const taxes = property.price.taxes || 0;
      const nightlyRate = property.price.amount;
      const totalPrice = (nightlyRate * nights) + cleaningFee + serviceFee + taxes;
      
      booking.totalPrice.amount = totalPrice;
      booking.totalPrice.breakdown.nightlyRate = nightlyRate;
    }

    await booking.save();

    res.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking (only for pending bookings)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only guest can delete their own booking
    if (booking.guest.toString() !== userId) {
      return res.status(403).json({ message: 'Only guest can delete booking' });
    }

    // Can only delete pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending bookings' });
    }

    await booking.remove();

    res.json({ message: 'Booking deleted successfully' });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/favorite
// @desc    Toggle favorite status for a property
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const user = await User.findById(userId);
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const isFavorite = user.favorites.includes(propertyId);
    
    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    res.json({
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

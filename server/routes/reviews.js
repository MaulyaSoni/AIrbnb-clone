const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
  auth,
  [
    body('propertyId').isMongoId().withMessage('Valid property ID is required'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
    body('rating.cleanliness').isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
    body('rating.communication').isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
    body('rating.checkIn').isInt({ min: 1, max: 5 }).withMessage('Check-in rating must be between 1 and 5'),
    body('rating.accuracy').isInt({ min: 1, max: 5 }).withMessage('Accuracy rating must be between 1 and 5'),
    body('rating.location').isInt({ min: 1, max: 5 }).withMessage('Location rating must be between 1 and 5'),
    body('rating.value').isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
    body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('comment').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    body('privateComment').optional().isLength({ max: 500 }).withMessage('Private comment cannot exceed 500 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, bookingId, rating, title, comment, privateComment } = req.body;
    const guestId = req.user.id;

    // Check if booking exists and belongs to the user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest.toString() !== guestId) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }

    if (booking.property.toString() !== propertyId) {
      return res.status(400).json({ message: 'Booking does not match property' });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    // Check if booking is completed (can only review completed stays)
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed stays' });
    }

    // Create review
    const review = new Review({
      property: propertyId,
      guest: guestId,
      host: booking.host,
      booking: bookingId,
      rating,
      title,
      comment,
      privateComment
    });

    await review.save();

    // Populate references for response
    await review.populate([
      { path: 'property', select: 'title' },
      { path: 'guest', select: 'name avatar' }
    ]);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/property/:propertyId
// @desc    Get reviews for a specific property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest':
        sortObj = { 'rating.overall': -1 };
        break;
      case 'lowest':
        sortObj = { 'rating.overall': 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const reviews = await Review.find({
      property: propertyId,
      status: 'active',
      isPublic: true
    })
      .populate([
        { path: 'guest', select: 'name avatar' },
        { path: 'response.host', select: 'name avatar' }
      ])
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      property: propertyId,
      status: 'active',
      isPublic: true
    });

    // Calculate average ratings
    const ratingStats = await Review.aggregate([
      { $match: { property: propertyId, status: 'active' } },
      { $group: {
        _id: null,
        avgOverall: { $avg: '$rating.overall' },
        avgCleanliness: { $avg: '$rating.cleanliness' },
        avgCommunication: { $avg: '$rating.communication' },
        avgCheckIn: { $avg: '$rating.checkIn' },
        avgAccuracy: { $avg: '$rating.accuracy' },
        avgLocation: { $avg: '$rating.location' },
        avgValue: { $avg: '$rating.value' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: ratingStats[0] || {
        avgOverall: 0,
        avgCleanliness: 0,
        avgCommunication: 0,
        avgCheckIn: 0,
        avgAccuracy: 0,
        avgLocation: 0,
        avgValue: 0,
        totalReviews: 0
      }
    });

  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user
// @desc    Get user's reviews (as guest or host)
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    let query = {};
    let populateFields = [];

    if (role === 'guest') {
      query.guest = userId;
      populateFields = [
        { path: 'property', select: 'title images location' },
        { path: 'host', select: 'name avatar' }
      ];
    } else if (role === 'host') {
      query.host = userId;
      populateFields = [
        { path: 'property', select: 'title images location' },
        { path: 'guest', select: 'name avatar' }
      ];
    } else {
      // Get all reviews where user is either guest or host
      query.$or = [{ guest: userId }, { host: userId }];
      populateFields = [
        { path: 'property', select: 'title images location' },
        { path: 'guest', select: 'name avatar' },
        { path: 'host', select: 'name avatar' }
      ];
    }

    const reviews = await Review.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate([
        { path: 'property', select: 'title images location' },
        { path: 'guest', select: 'name avatar' },
        { path: 'host', select: 'name avatar' },
        { path: 'response.host', select: 'name avatar' }
      ]);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if review is public
    if (!review.isPublic || review.status !== 'active') {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', [
  auth,
  [
    body('rating.overall').optional().isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
    body('rating.cleanliness').optional().isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
    body('rating.communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
    body('rating.checkIn').optional().isInt({ min: 1, max: 5 }).withMessage('Check-in rating must be between 1 and 5'),
    body('rating.accuracy').optional().isInt({ min: 1, max: 5 }).withMessage('Accuracy rating must be between 1 and 5'),
    body('rating.location').optional().isInt({ min: 1, max: 5 }).withMessage('Location rating must be between 1 and 5'),
    body('rating.value').optional().isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
    body('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('comment').optional().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    body('privateComment').optional().isLength({ max: 500 }).withMessage('Private comment cannot exceed 500 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { rating, title, comment, privateComment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only guest can edit their own review
    if (review.guest.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    // Update fields
    if (rating) review.rating = { ...review.rating, ...rating };
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (privateComment !== undefined) review.privateComment = privateComment;

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/response
// @desc    Add host response to a review
// @access  Private
router.post('/:id/response', [
  auth,
  [
    body('comment').isLength({ min: 1, max: 500 }).withMessage('Response must be between 1 and 500 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only host can respond to reviews
    if (review.host.toString() !== userId) {
      return res.status(403).json({ message: 'Only host can respond to reviews' });
    }

    // Check if response already exists
    if (review.response.host) {
      return res.status(400).json({ message: 'Response already exists' });
    }

    review.response.host = {
      comment,
      date: new Date()
    };

    await review.save();

    res.json({
      message: 'Response added successfully',
      review
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', [
  auth,
  [
    body('helpful').isBoolean().withMessage('Helpful must be a boolean value')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { helpful } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if review is public
    if (!review.isPublic || review.status !== 'active') {
      return res.status(400).json({ message: 'Cannot mark this review as helpful' });
    }

    // Add or update helpful vote
    await review.addReaction(userId, helpful ? '👍' : '👎');

    res.json({
      message: 'Review marked as helpful',
      review
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only guest can delete their own review
    if (review.guest.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.remove();

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

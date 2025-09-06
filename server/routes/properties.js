const express = require('express');
const { body, validationResult, query } = require('express-validator');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { auth, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Utility: Handle validation errors consistently
 */
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
};

/**
 * Utility: Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route   GET /api/properties
 * @desc    Get all properties with filters + pagination
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  async (req, res) => {
    try {
      const error = handleValidation(req, res);
      if (error) return error;

      const {
        page = 1,
        limit = 12,
        search,
        type,
        minPrice,
        maxPrice,
        guests,
        bedrooms,
        bathrooms,
        amenities,
        location,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter = { status: 'active' };

      if (search) filter.$text = { $search: search };
      if (type) filter.type = type;
      if (guests) filter['capacity.guests'] = { $gte: parseInt(guests) };
      if (bedrooms) filter['capacity.bedrooms'] = { $gte: parseInt(bedrooms) };
      if (bathrooms) filter['capacity.bathrooms'] = { $gte: parseInt(bathrooms) };

      if (minPrice || maxPrice) {
        filter['price.amount'] = {};
        if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
        if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
      }

      if (amenities) {
        const amenitiesArray = Array.isArray(amenities)
          ? amenities
          : amenities.split(',').filter((a) => a.trim());
        if (amenitiesArray.length) filter.amenities = { $all: amenitiesArray };
      }

      if (location) {
        filter.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } },
        ];
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [properties, total] = await Promise.all([
        Property.find(filter)
          .populate('host', 'name avatar')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Property.countDocuments(filter),
      ]);

      res.json({
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (err) {
      console.error('Get properties error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   GET /api/properties/my-properties
 * @desc    Get properties owned by the authenticated user
 * @access  Private
 */
router.get('/my-properties', auth, async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error('Get my properties error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/properties/featured
 * @desc    Get featured properties
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'active', featured: true })
      .populate('host', 'name avatar')
      .limit(6)
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.json(properties);
  } catch (err) {
    console.error('Get featured properties error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Public (auth optional)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(id)
      .populate('host', 'name avatar email phone')
      .populate({
        path: 'reviews',
        populate: { path: 'guest', select: 'name avatar' },
      });

    if (!property || property.status !== 'active') {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.views += 1;
    await property.save();

    res.json(property);
  } catch (err) {
    console.error('Get property error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Hosts only)
 */
router.post(
  '/',
  auth,
  authorize('user', 'host', 'admin'),
  [
    body('title').trim().isLength({ min: 5, max: 100 }),
    body('description').trim().isLength({ min: 20, max: 1000 }),
    body('type').isIn(['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']),
    body('location.address').trim().notEmpty(),
    body('location.city').trim().notEmpty(),
    body('location.state').trim().notEmpty(),
    body('location.country').trim().notEmpty(),
    body('price.amount').isFloat({ min: 0 }),
    body('capacity.guests').isInt({ min: 1 }),
    body('capacity.bedrooms').isInt({ min: 0 }),
    body('capacity.bathrooms').isInt({ min: 0 }),
    body('capacity.beds').isInt({ min: 1 }),
    body('images').isArray({ min: 1 }),
    body('amenities').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const error = handleValidation(req, res);
      if (error) return error;

      const propertyData = { ...req.body, host: req.user.id };
      if (propertyData.images?.length) {
        propertyData.images[0].isPrimary = true;
      }

      const property = new Property(propertyData);
      await property.save();

      await req.user.updateOne({ $push: { properties: property._id } });
      if (req.user.role === 'user') {
        await req.user.updateOne({ role: 'host' });
      }

      res.status(201).json({ message: 'Property created successfully', property });
    } catch (err) {
      console.error('Create property error:', err);
      res.status(500).json({ message: 'Server error during property creation', error: err.message });
    }
  }
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private (Property owner or admin)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    if (req.body.images?.length) {
      req.body.images[0].isPrimary = true;
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('host', 'name avatar');

    res.json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (err) {
    console.error('Update property error:', err);
    res.status(500).json({ message: 'Server error during property update', error: err.message });
  }
});

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private (Property owner or admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(id);
    await req.user.updateOne({ $pull: { properties: property._id } });

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('Delete property error:', err);
    res.status(500).json({ message: 'Server error during property deletion', error: err.message });
  }
});

/**
 * @route   POST /api/properties/:id/favorite
 * @desc    Toggle favorite property
 * @access  Private
 */
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isFavorite = req.user.favorites.includes(property._id);
    if (isFavorite) {
      await req.user.updateOne({ $pull: { favorites: property._id } });
      return res.json({ message: 'Property removed from favorites', isFavorite: false });
    } else {
      await req.user.updateOne({ $push: { favorites: property._id } });
      return res.json({ message: 'Property added to favorites', isFavorite: true });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Property = require('../models/Property');
const { auth, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('type').optional().isIn(['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('guests').optional().isInt({ min: 1 }),
  query('bedrooms').optional().isInt({ min: 0 }),
  query('bathrooms').optional().isInt({ min: 0 }),
  query('amenities').optional(),
  query('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

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
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (search) {
      filter.$text = { $search: search };
    }

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
      // Handle both array and comma-separated string formats
      const amenitiesArray = Array.isArray(amenities) 
        ? amenities 
        : amenities.split(',').filter(item => item.trim());
      
      if (amenitiesArray.length > 0) {
        filter.amenities = { $all: amenitiesArray };
      }
    }

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const properties = await Property.find(filter)
      .populate('host', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/featured
// @desc    Get featured properties
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ 
      status: 'active', 
      featured: true 
    })
    .populate('host', 'name avatar')
    .limit(6)
    .sort({ 'rating.average': -1, createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name avatar email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'active') {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties
// @desc    Create a new property
// @access  Private (Hosts only)
router.post('/', auth, authorize('user', 'host', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('type').isIn(['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']).withMessage('Invalid property type'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),
  body('price.amount').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('capacity.guests').isInt({ min: 1 }).withMessage('Guest capacity must be at least 1'),
  body('capacity.bedrooms').isInt({ min: 0 }).withMessage('Bedrooms cannot be negative'),
  body('capacity.bathrooms').isInt({ min: 0 }).withMessage('Bathrooms cannot be negative'),
  body('capacity.beds').isInt({ min: 1 }).withMessage('Must have at least 1 bed'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('amenities').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const propertyData = {
      ...req.body,
      host: req.user.id
    };

    // Set first image as primary
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images[0].isPrimary = true;
    }

    const property = new Property(propertyData);
    await property.save();

    // Update user's properties array
    await req.user.updateOne({ $push: { properties: property._id } });

    // Update user role to host if not already
    if (req.user.role === 'user') {
      await req.user.updateOne({ role: 'host' });
    }

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error during property creation' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Property owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('host', 'name avatar');

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error during property update' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Property owner or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    // Remove from user's properties array
    await req.user.updateOne({ $pull: { properties: property._id } });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error during property deletion' });
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Toggle favorite property
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const isFavorite = req.user.favorites.includes(property._id);
    
    if (isFavorite) {
      // Remove from favorites
      await req.user.updateOne({ $pull: { favorites: property._id } });
      res.json({ message: 'Property removed from favorites', isFavorite: false });
    } else {
      // Add to favorites
      await req.user.updateOne({ $push: { favorites: property._id } });
      res.json({ message: 'Property added to favorites', isFavorite: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

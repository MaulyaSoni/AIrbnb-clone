require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  try {
    const propertyId = '68ba98dd69dd002667aa08eb';
    const property = await Property.findById(propertyId);
    
    if (!property) {
      console.log('Property not found');
    } else {
      console.log('Property found:', property);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
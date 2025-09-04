const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');
const Booking = require('../models/Booking');

module.exports = {
  processPayment: async (req, res) => {
    try {
      const { bookingId, paymentMethodId } = req.body;

      // Get booking details
      const booking = await Booking.findById(bookingId)
        .populate('propertyId')
        .populate('userId');

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.CLIENT_URL}/bookings/${bookingId}`,
      });

      // Update booking with payment details
      booking.paymentStatus = 'completed';
      booking.stripePaymentIntentId = paymentIntent.id;
      await booking.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        bookingId: booking._id
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        message: 'Payment processing failed',
        error: error.message
      });
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const bookings = await Booking.find({ userId: req.user._id })
        .populate('propertyId')
        .sort({ createdAt: -1 });

      const paymentHistory = bookings.map(booking => ({
        bookingId: booking._id,
        propertyName: booking.propertyId.title,
        amount: booking.totalPrice,
        status: booking.paymentStatus,
        date: booking.createdAt
      }));

      res.json(paymentHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({
        message: 'Failed to fetch payment history',
        error: error.message
      });
    }
  },

  getTransactionDetails: async (req, res) => {
    try {
      const { transactionId } = req.params;
      const booking = await Booking.findById(transactionId)
        .populate('propertyId')
        .populate('userId');

      if (!booking) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Get payment intent details from Stripe if available
      let paymentDetails = null;
      if (booking.stripePaymentIntentId) {
        paymentDetails = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      }

      res.json({
        transactionId: booking._id,
        propertyDetails: {
          name: booking.propertyId.title,
          location: booking.propertyId.location,
          price: booking.propertyId.price
        },
        bookingDetails: {
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          nights: booking.nights,
          totalPrice: booking.totalPrice
        },
        paymentStatus: booking.paymentStatus,
        stripeDetails: paymentDetails
      });
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      res.status(500).json({
        message: 'Failed to fetch transaction details',
        error: error.message
      });
    }
  }
};
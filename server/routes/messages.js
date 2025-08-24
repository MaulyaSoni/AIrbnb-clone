const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/messages/conversations
// @desc    Create or get conversation
// @access  Private
router.post('/conversations', [
  auth,
  [
    body('participantIds').isArray({ min: 1 }).withMessage('At least one participant is required'),
    body('participantIds.*').isMongoId().withMessage('Valid participant IDs are required'),
    body('propertyId').optional().isMongoId().withMessage('Valid property ID is required'),
    body('bookingId').optional().isMongoId().withMessage('Valid booking ID is required')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantIds, propertyId, bookingId } = req.body;
    const userId = req.user.id;

    // Ensure current user is included in participants
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // Validate participants exist
    const participants = await User.find({ _id: { $in: participantIds } });
    if (participants.length !== participantIds.length) {
      return res.status(400).json({ message: 'One or more participants not found' });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(participantIds, propertyId, bookingId);

    // Populate participants for response
    await conversation.populate([
      { path: 'participants', select: 'name avatar' },
      { path: 'property', select: 'title images' },
      { path: 'lastMessage' }
    ]);

    res.json({
      message: 'Conversation created/retrieved successfully',
      conversation
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    const query = { participants: userId };
    
    if (archived === 'true') {
      query['isArchived.' + userId] = true;
    } else {
      query['isArchived.' + userId] = { $ne: true };
    }

    const conversations = await Conversation.find(query)
      .populate([
        { path: 'participants', select: 'name avatar' },
        { path: 'property', select: 'title images' },
        { path: 'lastMessage', select: 'content createdAt sender' }
      ])
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.json({
      conversations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get conversation by ID
// @access  Private
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId)
      .populate([
        { path: 'participants', select: 'name avatar' },
        { path: 'property', select: 'title images location' },
        { path: 'booking', select: 'checkIn checkOut guests' }
      ]);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user has access to this conversation
    if (!conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(conversation);

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', [
  auth,
  [
    body('content').isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
    body('messageType').optional().isIn(['text', 'image', 'file', 'system']).withMessage('Invalid message type'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    body('replyTo').optional().isMongoId().withMessage('Valid reply message ID is required')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, messageType = 'text', attachments = [], replyTo } = req.body;
    const userId = req.user.id;
    const conversationId = req.params.id;

    // Get conversation and check access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find recipient (other participants)
    const recipients = conversation.participants.filter(p => p.toString() !== userId);

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      recipient: recipients[0], // For now, send to first recipient
      content,
      messageType,
      attachments,
      replyTo
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for other participants
    recipients.forEach(recipientId => {
      conversation.incrementUnread(recipientId.toString());
    });

    await conversation.save();

    // Populate references for response
    await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'recipient', select: 'name avatar' },
      { path: 'replyTo', select: 'content' }
    ]);

    res.status(201).json({
      message: 'Message sent successfully',
      message: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.user.id;
    const conversationId = req.params.id;
    const skip = (page - 1) * limit;

    // Get conversation and check access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    let query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate([
        { path: 'sender', select: 'name avatar' },
        { path: 'recipient', select: 'name avatar' },
        { path: 'replyTo', select: 'content sender' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    // Mark messages as read for current user
    const unreadMessages = messages.filter(m => 
      m.recipient.toString() === userId && !m.isRead
    );

    for (const message of unreadMessages) {
      await message.markAsRead();
    }

    // Update conversation unread count
    if (unreadMessages.length > 0) {
      conversation.markAsRead(userId);
    }

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/conversations/:id/archive
// @desc    Archive/unarchive conversation for user
// @access  Private
router.put('/conversations/:id/archive', [
  auth,
  [
    body('archived').isBoolean().withMessage('Archived must be a boolean value')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { archived } = req.body;
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await conversation.archiveForUser(userId, archived);

    res.json({
      message: `Conversation ${archived ? 'archived' : 'unarchived'} successfully`,
      archived
    });

  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/conversations/:id/block
// @desc    Block/unblock conversation
// @access  Private
router.put('/conversations/:id/block', [
  auth,
  [
    body('blocked').isBoolean().withMessage('Blocked must be a boolean value'),
    body('reason').optional().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { blocked, reason = '' } = req.body;
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (blocked) {
      await conversation.blockConversation(userId, reason);
    } else {
      await conversation.unblockConversation(userId);
    }

    res.json({
      message: `Conversation ${blocked ? 'blocked' : 'unblocked'} successfully`,
      blocked
    });

  } catch (error) {
    console.error('Block conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', [
  auth,
  [
    body('content').isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can edit their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Cannot edit deleted messages
    if (message.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit deleted messages' });
    }

    await message.editMessage(content);

    res.json({
      message: 'Message edited successfully',
      message
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await message.deleteMessage(userId);

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:id/reactions
// @desc    Add reaction to a message
// @access  Private
router.post('/:id/reactions', [
  auth,
  [
    body('emoji').isLength({ min: 1, max: 10 }).withMessage('Emoji must be between 1 and 10 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emoji } = req.body;
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has access to this message
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !conversation.canUserAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await message.addReaction(userId, emoji);

    res.json({
      message: 'Reaction added successfully',
      message
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id/reactions
// @desc    Remove reaction from a message
// @access  Private
router.delete('/:id/reactions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(userId);

    res.json({
      message: 'Reaction removed successfully',
      message
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

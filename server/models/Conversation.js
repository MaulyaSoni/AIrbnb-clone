const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: Date,
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isArchived: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  isBlocked: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  blockedAt: Date,
  blockedReason: String,
  metadata: {
    title: String,
    type: {
      type: String,
      enum: ['general', 'booking', 'support', 'host'],
      default: 'general'
    },
    tags: [String]
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    autoArchive: { type: Boolean, default: false },
    autoArchiveDays: { type: Number, default: 30 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ property: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'unreadCount': 1 });

// Virtual for conversation title
conversationSchema.virtual('title').get(function() {
  if (this.metadata.title) return this.metadata.title;
  if (this.property) return `About ${this.property.title}`;
  return 'New conversation';
});

// Virtual for other participant (for 1-on-1 conversations)
conversationSchema.virtual('otherParticipant').get(function() {
  // This would need to be populated with the current user context
  return null;
});

// Method to add participant
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.unreadCount.set(userId.toString(), 0);
    this.isArchived.set(userId.toString(), false);
    this.isBlocked.set(userId.toString(), false);
  }
  return this.save();
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  this.unreadCount.delete(userId.toString());
  this.isArchived.delete(userId.toString());
  this.isBlocked.delete(userId.toString());
  return this.save();
};

// Method to mark as read for a user
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = function(userId) {
  const current = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), current + 1);
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to archive conversation for a user
conversationSchema.methods.archiveForUser = function(userId, archived = true) {
  this.isArchived.set(userId.toString(), archived);
  return this.save();
};

// Method to block conversation
conversationSchema.methods.blockConversation = function(userId, reason = '') {
  this.isBlocked.set(userId.toString(), true);
  this.blockedBy = userId;
  this.blockedAt = new Date();
  this.blockedReason = reason;
  return this.save();
};

// Method to unblock conversation
conversationSchema.methods.unblockConversation = function(userId) {
  this.isBlocked.set(userId.toString(), false);
  this.blockedBy = undefined;
  this.blockedAt = undefined;
  this.blockedReason = undefined;
  return this.save();
};

// Method to check if user is blocked
conversationSchema.methods.isUserBlocked = function(userId) {
  return this.isBlocked.get(userId.toString()) || false;
};

// Method to check if user can access conversation
conversationSchema.methods.canUserAccess = function(userId) {
  return this.participants.includes(userId) && !this.isUserBlocked(userId);
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(participantIds, propertyId = null, bookingId = null) {
  // For 1-on-1 conversations, find existing one
  if (participantIds.length === 2) {
    let conversation = await this.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
      property: propertyId || { $exists: false },
      booking: bookingId || { $exists: false }
    });
    
    if (conversation) {
      return conversation;
    }
  }
  
  // Create new conversation
  const conversation = new this({
    participants: participantIds,
    property: propertyId,
    booking: bookingId,
    metadata: {
      type: propertyId ? 'booking' : 'general'
    }
  });
  
  // Initialize unread counts and archive status for all participants
  participantIds.forEach(participantId => {
    conversation.unreadCount.set(participantId.toString(), 0);
    conversation.isArchived.set(participantId.toString(), false);
    conversation.isBlocked.set(participantId.toString(), false);
  });
  
  return conversation.save();
};

// Ensure virtual fields are serialized
conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Conversation', conversationSchema);

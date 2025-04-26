const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['server', 'custom', 'recurring'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: false
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['attending', 'maybe', 'not_attending'],
      default: 'maybe'
    }
  }],
  maxParticipants: {
    type: Number,
    required: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    required: false
  },
  reminders: [{
    time: Date,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check if event is full
eventSchema.methods.isFull = function() {
  return this.maxParticipants && this.participants.length >= this.maxParticipants;
};

// Instance method to add participant
eventSchema.methods.addParticipant = function(userId, status = 'attending') {
  if (this.isFull()) {
    throw new Error('Event is full');
  }
  
  const participantIndex = this.participants.findIndex(p => p.user.toString() === userId.toString());
  
  if (participantIndex === -1) {
    this.participants.push({ user: userId, status });
  } else {
    this.participants[participantIndex].status = status;
  }
};

module.exports = mongoose.model('Event', eventSchema);
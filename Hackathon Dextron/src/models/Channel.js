const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discordChannelId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'category', 'announcement'],
    required: true
  },
  category: {
    type: String,
    required: false
  },
  topic: {
    type: String,
    required: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    slowMode: {
      type: Number,
      default: 0
    },
    nsfw: {
      type: Boolean,
      default: false
    },
    autoArchiveDuration: {
      type: Number,
      default: 1440
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update timestamp on save
channelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user has access
channelSchema.methods.canAccess = function(userId, userRoles) {
  if (!this.isPrivate) return true;
  
  if (this.allowedUsers.includes(userId)) return true;
  
  return this.allowedRoles.some(roleId =>
    userRoles.includes(roleId.toString())
  );
};

// Method to add allowed role
channelSchema.methods.addAllowedRole = function(roleId) {
  if (!this.allowedRoles.includes(roleId)) {
    this.allowedRoles.push(roleId);
  }
};

// Method to remove allowed role
channelSchema.methods.removeAllowedRole = function(roleId) {
  const index = this.allowedRoles.indexOf(roleId);
  if (index > -1) {
    this.allowedRoles.splice(index, 1);
  }
};

module.exports = mongoose.model('Channel', channelSchema);
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  discordRoleId: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: String,
    enum: [
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'MANAGE_MESSAGES',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CREATE_EVENTS',
      'MANAGE_EVENTS',
      'VIEW_AUDIT_LOG',
      'SEND_MESSAGES',
      'READ_MESSAGES'
    ]
  }],
  level: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    default: '#99AAB5'
  },
  isAssignable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: false
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
roleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to add permission
roleSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
};

// Method to remove permission
roleSchema.methods.removePermission = function(permission) {
  const index = this.permissions.indexOf(permission);
  if (index > -1) {
    this.permissions.splice(index, 1);
  }
};

module.exports = mongoose.model('Role', roleSchema);
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  discordMessageId: {
    type: String,
    required: true,
    unique: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'embed', 'system', 'command'],
    default: 'text'
  },
  attachments: [{
    url: String,
    name: String,
    type: String
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    emoji: String,
    count: Number,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
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
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add reaction
messageSchema.methods.addReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (reaction) {
    if (!reaction.users.includes(userId)) {
      reaction.users.push(userId);
      reaction.count += 1;
    }
  } else {
    this.reactions.push({
      emoji,
      count: 1,
      users: [userId]
    });
  }
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (reaction) {
    const userIndex = reaction.users.indexOf(userId);
    if (userIndex > -1) {
      reaction.users.splice(userIndex, 1);
      reaction.count -= 1;
      
      if (reaction.count === 0) {
        const reactionIndex = this.reactions.indexOf(reaction);
        this.reactions.splice(reactionIndex, 1);
      }
    }
  }
};

// Method to edit message
messageSchema.methods.edit = function(newContent) {
  this.editHistory.push({
    content: this.content,
    editedAt: this.updatedAt
  });
  
  this.content = newContent;
  this.isEdited = true;
};

module.exports = mongoose.model('Message', messageSchema);